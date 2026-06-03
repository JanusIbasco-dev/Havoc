package dev.havoc.leaderboard.config;

import org.bukkit.configuration.file.FileConfiguration;

import java.time.Duration;
import java.util.Map;

public record PluginSettings(
        String baseUrl,
        String apiKey,
        Duration timeout,
        Map<String, String> endpoints,
        int killAward,
        int deathDeduction,
        boolean deductOnlyPvpDeaths,
        boolean retryEnabled,
        long retryIntervalTicks,
        int maxRetryAttempts,
        String retryQueueFile,
        boolean elyByLookupEnabled,
        boolean debug
) {
    public static PluginSettings from(FileConfiguration config) {
        return new PluginSettings(
                trimTrailingSlash(config.getString("api.base-url", "")),
                config.getString("api.api-key", ""),
                Duration.ofSeconds(config.getLong("api.timeout-seconds", 10L)),
                Map.of(
                        "register-player", config.getString("api.endpoints.register-player", "/players/register"),
                        "update-player", config.getString("api.endpoints.update-player", "/players/update"),
                        "update-skin", config.getString("api.endpoints.update-skin", "/players/skin"),
                        "refresh-skin", config.getString("api.endpoints.refresh-skin", "/players/refresh-skin"),
                        "kill-event", config.getString("api.endpoints.kill-event", "/events/kill"),
                        "death-event", config.getString("api.endpoints.death-event", "/events/death"),
                        "sync-points", config.getString("api.endpoints.sync-points", "/leaderboard/sync")
                ),
                config.getInt("points.kill-award", 15),
                config.getInt("points.death-deduction", 13),
                config.getBoolean("points.deduct-only-pvp-deaths", true),
                config.getBoolean("retry.enabled", true),
                Math.max(20L, config.getLong("retry.interval-seconds", 30L) * 20L),
                config.getInt("retry.max-attempts", 0),
                config.getString("retry.queue-file", "retry-queue.json"),
                config.getBoolean("skin.elyby-lookup-enabled", true),
                config.getBoolean("logging.debug", true)
        );
    }

    public String endpointUrl(String key) {
        String path = trimTrailingSlash(endpoints.getOrDefault(key, ""));
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return baseUrl + path;
    }

    private static String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
