package dev.havoc.leaderboard.api;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import dev.havoc.leaderboard.LeaderboardHavocPlugin;
import dev.havoc.leaderboard.config.PluginSettings;
import dev.havoc.leaderboard.model.PlayerRecord;
import dev.havoc.leaderboard.model.SkinData;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.logging.Level;

public final class LeaderboardApiClient {
    private final LeaderboardHavocPlugin plugin;
    private final PluginSettings settings;
    private final RetryQueue retryQueue;
    private final HttpClient httpClient;
    private static final int MAX_REDIRECTS = 5;

    public LeaderboardApiClient(LeaderboardHavocPlugin plugin, PluginSettings settings, RetryQueue retryQueue) {
        this.plugin = plugin;
        this.settings = settings;
        this.retryQueue = retryQueue;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(settings.timeout())
                .build();
        retryQueue.setApiClient(this);
    }

    public void registerPlayer(PlayerRecord record) {
        JsonObject payload = playerPayload(record);
        sendAsync("register-player", payload);
    }

    public void updatePlayer(PlayerRecord record) {
        JsonObject payload = playerPayload(record);
        sendAsync("update-player", payload);
    }

    public void updateSkin(PlayerRecord record, SkinData skinData) {
        JsonObject payload = basePlayerPayload(record);
        addSkinPayload(payload, skinData);
        payload.addProperty("timestamp", Instant.now().toString());
        sendAsync("update-skin", payload);
    }

    public void refreshSkin(PlayerRecord record, SkinData skinData) {
        JsonObject payload = basePlayerPayload(record);
        addSkinPayload(payload, skinData);
        payload.addProperty("timestamp", Instant.now().toString());
        sendAsync("refresh-skin", payload);
    }

    public void sendKillEvent(PlayerRecord killer, PlayerRecord victim, int pointsAwarded, long timestamp, String eventId) {
        JsonObject payload = new JsonObject();
        payload.addProperty("eventId", eventId);
        payload.addProperty("killerUuid", killer.uuid().toString());
        payload.addProperty("killerUsername", killer.username());
        payload.addProperty("victimUuid", victim.uuid().toString());
        payload.addProperty("victimUsername", victim.username());
        payload.addProperty("pointsAwarded", pointsAwarded);
        payload.addProperty("killerUpdatedTotalPoints", killer.points());
        payload.addProperty("timestamp", Instant.ofEpochMilli(timestamp).toString());
        sendAsync("kill-event", payload);
    }

    public void sendDeathEvent(PlayerRecord player, int pointsDeducted, long timestamp, String eventId) {
        JsonObject payload = basePlayerPayload(player);
        payload.addProperty("eventId", eventId);
        payload.addProperty("pointsDeducted", pointsDeducted);
        payload.addProperty("updatedTotalPoints", player.points());
        payload.addProperty("timestamp", Instant.ofEpochMilli(timestamp).toString());
        sendAsync("death-event", payload);
    }

    public void syncPoints(PlayerRecord record) {
        JsonObject payload = basePlayerPayload(record);
        payload.addProperty("points", record.points());
        payload.addProperty("kills", record.kills());
        payload.addProperty("deaths", record.deaths());
        payload.addProperty("timestamp", Instant.now().toString());
        sendAsync("sync-points", payload);
    }

    public void syncLeaderboard(List<PlayerRecord> records) {
        JsonObject payload = new JsonObject();
        JsonArray players = new JsonArray();
        for (PlayerRecord record : records) {
            JsonObject player = basePlayerPayload(record);
            player.addProperty("points", record.points());
            player.addProperty("kills", record.kills());
            player.addProperty("deaths", record.deaths());
            players.add(player);
        }
        payload.add("players", players);
        payload.addProperty("timestamp", Instant.now().toString());
        sendAsync("sync-points", payload);
    }

    public CompletableFuture<Boolean> sendAsync(String endpointKey, JsonObject payload) {
        return CompletableFuture.supplyAsync(() -> sendBlocking(endpointKey, payload, true));
    }

    public boolean sendBlocking(String endpointKey, JsonObject payload, boolean queueOnFailure) {
        if (settings.baseUrl().isBlank() || settings.apiKey().isBlank() || "change-me".equals(settings.apiKey())) {
            plugin.getLogger().warning("API URL or key is not configured; storing request locally for " + endpointKey);
            if (queueOnFailure) {
                retryQueue.enqueue(endpointKey, payload);
            }
            return false;
        }

        String requestBody = payload.toString();
        URI requestUri = URI.create(settings.endpointUrl(endpointKey));
        try {
            HttpResponse<String> response = sendWithRedirects(endpointKey, requestUri, requestBody);
            boolean success = response.statusCode() >= 200 && response.statusCode() < 300;
            if (!success) {
                plugin.getLogger().warning("API request failed for " + endpointKey + " at " + response.uri() + " with HTTP " + response.statusCode() + ": " + response.body());
                if (queueOnFailure) {
                    retryQueue.enqueue(endpointKey, payload);
                }
            } else if (settings.debug()) {
                plugin.getLogger().info("API request succeeded for " + endpointKey + " at " + response.uri() + " with HTTP " + response.statusCode());
            }
            return success;
        } catch (IOException | InterruptedException | IllegalArgumentException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            plugin.getLogger().log(Level.WARNING, "API request failed for " + endpointKey + ".", exception);
            if (queueOnFailure) {
                retryQueue.enqueue(endpointKey, payload);
            }
            return false;
        }
    }

    private HttpResponse<String> sendWithRedirects(String endpointKey, URI initialUri, String requestBody) throws IOException, InterruptedException {
        URI currentUri = initialUri;

        for (int redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
            HttpRequest request = buildPostRequest(currentUri, requestBody);
            if (settings.debug()) {
                plugin.getLogger().info("Sending API request: " + endpointKey + " -> " + request.uri());
            }

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            logResponseDiagnostics(endpointKey, response);

            if (!isRedirect(response.statusCode())) {
                if (settings.debug()) {
                    plugin.getLogger().info("Final API URL for " + endpointKey + ": " + response.uri());
                }
                return response;
            }

            Optional<String> location = response.headers().firstValue("location");
            if (settings.debug()) {
                plugin.getLogger().warning("API redirect for " + endpointKey + " returned HTTP " + response.statusCode() + " Location: " + location.orElse("<missing>"));
            }

            if (location.isEmpty()) {
                return response;
            }

            currentUri = currentUri.resolve(location.get());
        }

        throw new IOException("Too many redirects for " + endpointKey + " after " + MAX_REDIRECTS + " redirects.");
    }

    private HttpRequest buildPostRequest(URI uri, String requestBody) {
        return HttpRequest.newBuilder()
                .uri(uri)
                .timeout(settings.timeout())
                .header("Authorization", "Bearer " + settings.apiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                .build();
    }

    private void logResponseDiagnostics(String endpointKey, HttpResponse<String> response) {
        if (!settings.debug()) {
            return;
        }

        plugin.getLogger().info("API response for " + endpointKey + " from " + response.uri() + " returned HTTP " + response.statusCode());
        for (Map.Entry<String, List<String>> header : response.headers().map().entrySet()) {
            plugin.getLogger().info("API response header for " + endpointKey + ": " + header.getKey() + "=" + String.join(",", header.getValue()));
        }
        response.headers().firstValue("location").ifPresent((location) ->
                plugin.getLogger().warning("API Location header for " + endpointKey + ": " + location)
        );
    }

    private boolean isRedirect(int statusCode) {
        return statusCode == 301 || statusCode == 302 || statusCode == 303 || statusCode == 307 || statusCode == 308;
    }

    private JsonObject playerPayload(PlayerRecord record) {
        JsonObject payload = basePlayerPayload(record);
        payload.addProperty("firstJoinTimestamp", Instant.ofEpochMilli(record.firstJoinTimestamp()).toString());
        payload.addProperty("points", record.points());
        payload.addProperty("kills", record.kills());
        payload.addProperty("deaths", record.deaths());
        addSkinPayload(payload, new SkinData(record.skinValue(), record.skinSignature(), record.skinUrl(), record.skinProvider()));
        payload.addProperty("timestamp", Instant.now().toString());
        return payload;
    }

    private JsonObject basePlayerPayload(PlayerRecord record) {
        JsonObject payload = new JsonObject();
        payload.addProperty("uuid", record.uuid().toString());
        payload.addProperty("username", record.username());
        payload.addProperty("platform", record.platform() == null || record.platform().isBlank() ? "java" : record.platform());
        payload.addProperty("xuid", record.xuid());
        payload.addProperty("floodgateUuid", record.floodgateUuid());
        return payload;
    }

    private JsonObject storedSkinPayload(PlayerRecord record) {
        return skinPayload(new SkinData(record.skinValue(), record.skinSignature(), record.skinUrl(), record.skinProvider()));
    }

    private void addSkinPayload(JsonObject payload, SkinData skinData) {
        payload.add("skin", skinPayload(skinData));
        payload.addProperty("skinUrl", skinData.skinUrl());
        payload.addProperty("skinTextureValue", skinData.textureValue());
        payload.addProperty("skinTextureSignature", skinData.signature());
        payload.addProperty("skinProvider", skinData.provider());
    }

    private JsonObject skinPayload(SkinData skinData) {
        JsonObject skin = new JsonObject();
        skin.addProperty("textureValue", skinData.textureValue());
        skin.addProperty("signature", skinData.signature());
        skin.addProperty("skinUrl", skinData.skinUrl());
        skin.addProperty("provider", skinData.provider());
        return skin;
    }
}
