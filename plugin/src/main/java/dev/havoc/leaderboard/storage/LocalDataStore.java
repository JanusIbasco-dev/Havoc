package dev.havoc.leaderboard.storage;

import dev.havoc.leaderboard.LeaderboardHavocPlugin;
import dev.havoc.leaderboard.model.PlayerRecord;
import dev.havoc.leaderboard.model.SkinData;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.entity.Player;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;

public final class LocalDataStore {
    private final LeaderboardHavocPlugin plugin;
    private final File file;
    private final FileConfiguration data;

    public LocalDataStore(LeaderboardHavocPlugin plugin) {
        this.plugin = plugin;
        this.file = new File(plugin.getDataFolder(), "data.yml");
        this.data = YamlConfiguration.loadConfiguration(file);
    }

    public synchronized PlayerRecord getOrCreate(Player player, SkinData skinData) {
        String path = playerPath(player.getUniqueId());
        long firstJoin = player.getFirstPlayed() > 0 ? player.getFirstPlayed() : System.currentTimeMillis();
        if (!data.contains(path)) {
            data.set(path + ".username", player.getName());
            data.set(path + ".first-join-timestamp", firstJoin);
            data.set(path + ".points", 0);
            data.set(path + ".kills", 0);
            data.set(path + ".deaths", 0);
            applySkin(path, skinData);
            save();
        }
        return load(player.getUniqueId());
    }

    public synchronized boolean hasPlayer(UUID uuid) {
        return data.contains(playerPath(uuid));
    }

    public synchronized PlayerRecord load(UUID uuid) {
        String path = playerPath(uuid);
        PlayerRecord record = new PlayerRecord(
                uuid,
                data.getString(path + ".username", ""),
                data.getLong(path + ".first-join-timestamp", System.currentTimeMillis())
        );
        record.points(data.getInt(path + ".points", 0));
        record.kills(data.getInt(path + ".kills", 0));
        record.deaths(data.getInt(path + ".deaths", 0));
        record.skinValue(data.getString(path + ".skin.value"));
        record.skinSignature(data.getString(path + ".skin.signature"));
        record.skinUrl(data.getString(path + ".skin.url"));
        return record;
    }

    public synchronized boolean updateIdentity(Player player, SkinData skinData) {
        String path = playerPath(player.getUniqueId());
        String oldName = data.getString(path + ".username", "");
        String oldFingerprint = skinFingerprint(path);
        boolean changed = !oldName.equals(player.getName()) || !oldFingerprint.equals(skinData.fingerprint());
        if (changed) {
            data.set(path + ".username", player.getName());
            applySkin(path, skinData);
            save();
        }
        return changed;
    }

    public synchronized PlayerRecord awardKill(Player player, int amount) {
        String path = playerPath(player.getUniqueId());
        data.set(path + ".points", data.getInt(path + ".points", 0) + amount);
        data.set(path + ".kills", data.getInt(path + ".kills", 0) + 1);
        data.set(path + ".username", player.getName());
        save();
        return load(player.getUniqueId());
    }

    public synchronized PlayerRecord deductDeath(Player player, int amount) {
        String path = playerPath(player.getUniqueId());
        data.set(path + ".points", data.getInt(path + ".points", 0) - amount);
        data.set(path + ".deaths", data.getInt(path + ".deaths", 0) + 1);
        data.set(path + ".username", player.getName());
        save();
        return load(player.getUniqueId());
    }

    public synchronized List<PlayerRecord> allPlayers() {
        List<PlayerRecord> records = new ArrayList<>();
        ConfigurationSection section = data.getConfigurationSection("players");
        if (section == null) {
            return records;
        }
        for (String key : section.getKeys(false)) {
            try {
                records.add(load(UUID.fromString(key)));
            } catch (IllegalArgumentException ignored) {
                plugin.getLogger().warning("Skipping invalid UUID in data.yml: " + key);
            }
        }
        return records;
    }

    public synchronized void save() {
        try {
            data.save(file);
        } catch (IOException exception) {
            plugin.getLogger().log(Level.SEVERE, "Unable to save local leaderboard data.", exception);
        }
    }

    private void applySkin(String path, SkinData skinData) {
        data.set(path + ".skin.value", skinData.textureValue());
        data.set(path + ".skin.signature", skinData.signature());
        data.set(path + ".skin.url", skinData.skinUrl());
    }

    private String skinFingerprint(String path) {
        return "%s|%s|%s".formatted(
                data.getString(path + ".skin.value", ""),
                data.getString(path + ".skin.signature", ""),
                data.getString(path + ".skin.url", "")
        );
    }

    private String playerPath(UUID uuid) {
        return "players." + uuid;
    }
}
