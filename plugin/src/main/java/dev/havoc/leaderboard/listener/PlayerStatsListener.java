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

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public final class PlayerStatsListener implements Listener {
    private static final long DUPLICATE_DEATH_WINDOW_MILLIS = 2_000L;

    private final LeaderboardHavocPlugin plugin;
    private final Map<String, Long> recentPvpDeaths = new ConcurrentHashMap<>();

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
            if (isDuplicatePvpDeath(killer, victim, timestamp)) {
                if (plugin.settings().debug()) {
                    plugin.getLogger().warning("Ignoring duplicate PlayerDeathEvent for " + killer.getName() + " -> " + victim.getName());
                }
                return;
            }
            handlePvpDeath(killer, victim, timestamp);
            return;
        }

        if (!plugin.settings().deductOnlyPvpDeaths()) {
            String eventId = UUID.randomUUID().toString();
            PlayerRecord victimRecord = plugin.dataStore().deductDeath(victim, plugin.settings().deathDeduction());
            plugin.apiClient().sendDeathEvent(victimRecord, plugin.settings().deathDeduction(), timestamp, eventId);
        }
    }

    private void handlePvpDeath(Player killer, Player victim, long timestamp) {
        String eventId = UUID.randomUUID().toString();
        PlayerRecord killerRecord = plugin.dataStore().awardKill(killer, plugin.settings().killAward());
        PlayerRecord victimRecord = plugin.dataStore().deductDeath(victim, plugin.settings().deathDeduction());

        if (plugin.settings().debug()) {
            plugin.getLogger().info(killer.getName() + " killed " + victim.getName()
                    + " eventId=" + eventId
                    + " (killer +" + plugin.settings().killAward() + " points, +1 kill; victim -" + plugin.settings().deathDeduction() + " points, +1 death)");
        }

        plugin.apiClient().sendKillEvent(killerRecord, victimRecord, plugin.settings().killAward(), timestamp, eventId);
        plugin.apiClient().sendDeathEvent(victimRecord, plugin.settings().deathDeduction(), timestamp, eventId);
    }

    private boolean isDuplicatePvpDeath(Player killer, Player victim, long timestamp) {
        recentPvpDeaths.entrySet().removeIf((entry) -> timestamp - entry.getValue() > DUPLICATE_DEATH_WINDOW_MILLIS);
        String key = killer.getUniqueId() + ":" + victim.getUniqueId();
        Long previousTimestamp = recentPvpDeaths.put(key, timestamp);
        return previousTimestamp != null && timestamp - previousTimestamp <= DUPLICATE_DEATH_WINDOW_MILLIS;
    }
}
