package dev.havoc.leaderboard;

import dev.havoc.leaderboard.api.LeaderboardApiClient;
import dev.havoc.leaderboard.api.RetryQueue;
import dev.havoc.leaderboard.command.LeaderboardCommand;
import dev.havoc.leaderboard.config.PluginSettings;
import dev.havoc.leaderboard.listener.PlayerStatsListener;
import dev.havoc.leaderboard.storage.LocalDataStore;
import org.bukkit.command.PluginCommand;
import org.bukkit.plugin.java.JavaPlugin;

public final class LeaderboardHavocPlugin extends JavaPlugin {
    private PluginSettings settings;
    private LocalDataStore dataStore;
    private RetryQueue retryQueue;
    private LeaderboardApiClient apiClient;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        reloadServices();

        getServer().getPluginManager().registerEvents(
                new PlayerStatsListener(this),
                this
        );

        LeaderboardCommand commandExecutor = new LeaderboardCommand(this);
        PluginCommand command = getCommand("leaderboardhavoc");
        if (command != null) {
            command.setExecutor(commandExecutor);
            command.setTabCompleter(commandExecutor);
        }

        retryQueue.start();
        getLogger().info("Leaderboard Havoc enabled.");
    }

    @Override
    public void onDisable() {
        if (retryQueue != null) {
            retryQueue.save();
        }
        if (dataStore != null) {
            dataStore.save();
        }
        getLogger().info("Leaderboard Havoc disabled.");
    }

    public void reloadServices() {
        reloadConfig();
        if (retryQueue != null) {
            retryQueue.stop();
        }
        settings = PluginSettings.from(getConfig());
        dataStore = new LocalDataStore(this);
        retryQueue = new RetryQueue(this, settings);
        apiClient = new LeaderboardApiClient(this, settings, retryQueue);
        if (isEnabled()) {
            retryQueue.start();
        }
    }

    public PluginSettings settings() {
        return settings;
    }

    public LocalDataStore dataStore() {
        return dataStore;
    }

    public LeaderboardApiClient apiClient() {
        return apiClient;
    }
}
