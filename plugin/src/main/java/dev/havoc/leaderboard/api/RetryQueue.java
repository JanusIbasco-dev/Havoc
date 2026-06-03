package dev.havoc.leaderboard.api;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import dev.havoc.leaderboard.LeaderboardHavocPlugin;
import dev.havoc.leaderboard.config.PluginSettings;
import org.bukkit.scheduler.BukkitTask;

import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;

public final class RetryQueue {
    private static final Type LIST_TYPE = new TypeToken<List<PendingRequest>>() { }.getType();

    private final LeaderboardHavocPlugin plugin;
    private final PluginSettings settings;
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final List<PendingRequest> queue = new ArrayList<>();
    private BukkitTask task;
    private LeaderboardApiClient apiClient;

    public RetryQueue(LeaderboardHavocPlugin plugin, PluginSettings settings) {
        this.plugin = plugin;
        this.settings = settings;
        load();
    }

    public void setApiClient(LeaderboardApiClient apiClient) {
        this.apiClient = apiClient;
    }

    public synchronized void enqueue(String endpointKey, com.google.gson.JsonObject payload) {
        if (!settings.retryEnabled()) {
            return;
        }
        queue.add(new PendingRequest(endpointKey, payload.deepCopy()));
        save();
        plugin.getLogger().warning("Queued failed API request for retry: " + endpointKey + " (queue size " + queue.size() + ")");
    }

    public void start() {
        if (!settings.retryEnabled() || task != null) {
            return;
        }
        task = plugin.getServer().getScheduler().runTaskTimerAsynchronously(
                plugin,
                this::process,
                settings.retryIntervalTicks(),
                settings.retryIntervalTicks()
        );
    }

    public void stop() {
        if (task != null) {
            task.cancel();
            task = null;
        }
    }

    public synchronized void save() {
        try {
            Files.createDirectories(path().getParent());
            try (Writer writer = Files.newBufferedWriter(path())) {
                gson.toJson(queue, writer);
            }
        } catch (IOException exception) {
            plugin.getLogger().log(Level.SEVERE, "Unable to save API retry queue.", exception);
        }
    }

    private void process() {
        LeaderboardApiClient client = apiClient;
        if (client == null) {
            return;
        }

        List<PendingRequest> snapshot;
        synchronized (this) {
            if (queue.isEmpty()) {
                return;
            }
            snapshot = new ArrayList<>(queue);
        }

        for (PendingRequest request : snapshot) {
            boolean success = client.sendBlocking(request.endpointKey(), request.payload(), false);
            synchronized (this) {
                if (success) {
                    queue.remove(request);
                    plugin.getLogger().info("Retried API request successfully: " + request.endpointKey());
                } else {
                    request.incrementAttempts();
                    if (settings.maxRetryAttempts() > 0 && request.attempts() >= settings.maxRetryAttempts()) {
                        queue.remove(request);
                        plugin.getLogger().warning("Dropping API request after max attempts: " + request.endpointKey());
                    }
                }
                save();
            }
        }
    }

    private void load() {
        Path path = path();
        if (!Files.exists(path)) {
            return;
        }
        try (Reader reader = Files.newBufferedReader(path)) {
            List<PendingRequest> loaded = gson.fromJson(reader, LIST_TYPE);
            if (loaded != null) {
                queue.clear();
                Iterator<PendingRequest> iterator = loaded.iterator();
                while (iterator.hasNext()) {
                    PendingRequest request = iterator.next();
                    if (request.endpointKey() == null || request.payload() == null) {
                        iterator.remove();
                    }
                }
                queue.addAll(loaded);
            }
        } catch (IOException exception) {
            plugin.getLogger().log(Level.SEVERE, "Unable to load API retry queue.", exception);
        }
    }

    private Path path() {
        return plugin.getDataFolder().toPath().resolve(settings.retryQueueFile());
    }
}
