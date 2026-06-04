package dev.havoc.leaderboard.listener;

import dev.havoc.leaderboard.LeaderboardHavocPlugin;
import dev.havoc.leaderboard.model.PlayerRecord;
import dev.havoc.leaderboard.model.PlatformData;
import dev.havoc.leaderboard.model.SkinData;
import dev.havoc.leaderboard.platform.PlatformService;
import dev.havoc.leaderboard.skin.SkinService;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerJoinEvent;

public final class PlayerStatsListener implements Listener {
    private final LeaderboardHavocPlugin plugin;

    public PlayerStatsListener(LeaderboardHavocPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        SkinData skinData = SkinService.from(player, plugin.settings().elyByLookupEnabled());
        PlatformData platformData = PlatformService.from(player);
        boolean firstSeenLocally = !plugin.dataStore().hasPlayer(player.getUniqueId());

        PlayerRecord record = plugin.dataStore().getOrCreate(player, skinData, platformData);
        boolean changed = plugin.dataStore().updateIdentity(player, skinData, platformData);
        PlayerRecord updated = plugin.dataStore().load(player.getUniqueId());

        if (firstSeenLocally) {
            if (plugin.settings().debug()) {
                plugin.getLogger().info("Registering first-time player " + player.getName() + " (" + player.getUniqueId() + ")");
            }
            plugin.apiClient().registerPlayer(updated);
            return;
        }

        if (changed) {
            if (plugin.settings().debug()) {
                plugin.getLogger().info("Updating changed player profile for " + player.getName() + " (" + player.getUniqueId() + ")");
            }
            plugin.apiClient().updatePlayer(updated);
            plugin.apiClient().refreshSkin(updated, skinData);
        } else if (plugin.settings().debug()) {
            plugin.getLogger().info("Player profile unchanged for " + record.username() + " (" + player.getUniqueId() + ")");
        }
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onDeath(PlayerDeathEvent event) {
        Player victim = event.getEntity();
        Player killer = victim.getKiller();
        long timestamp = System.currentTimeMillis();

        if (killer != null && !killer.getUniqueId().equals(victim.getUniqueId())) {
            handlePvpDeath(killer, victim, timestamp);
            return;
        }

        if (!plugin.settings().deductOnlyPvpDeaths()) {
            PlayerRecord victimRecord = plugin.dataStore().deductDeath(victim, plugin.settings().deathDeduction());
            plugin.apiClient().sendDeathEvent(victimRecord, plugin.settings().deathDeduction(), timestamp);
            plugin.apiClient().syncPoints(victimRecord);
        }
    }

    private void handlePvpDeath(Player killer, Player victim, long timestamp) {
        PlayerRecord killerRecord = plugin.dataStore().awardKill(killer, plugin.settings().killAward());
        PlayerRecord victimRecord = plugin.dataStore().deductDeath(victim, plugin.settings().deathDeduction());

        if (plugin.settings().debug()) {
            plugin.getLogger().info(killer.getName() + " killed " + victim.getName()
                    + " (+" + plugin.settings().killAward() + " / -" + plugin.settings().deathDeduction() + ")");
        }

        plugin.apiClient().sendKillEvent(killerRecord, victimRecord, plugin.settings().killAward(), timestamp);
        plugin.apiClient().sendDeathEvent(victimRecord, plugin.settings().deathDeduction(), timestamp);
        plugin.apiClient().syncPoints(killerRecord);
        plugin.apiClient().syncPoints(victimRecord);
    }
}
