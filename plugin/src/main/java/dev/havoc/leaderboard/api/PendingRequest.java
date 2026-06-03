package dev.havoc.leaderboard.api;

import com.google.gson.JsonObject;

public final class PendingRequest {
    private String endpointKey;
    private JsonObject payload;
    private int attempts;
    private long queuedAt;

    public PendingRequest(String endpointKey, JsonObject payload) {
        this.endpointKey = endpointKey;
        this.payload = payload;
        this.queuedAt = System.currentTimeMillis();
    }

    public String endpointKey() {
        return endpointKey;
    }

    public JsonObject payload() {
        return payload;
    }

    public int attempts() {
        return attempts;
    }

    public void incrementAttempts() {
        attempts++;
    }

    public long queuedAt() {
        return queuedAt;
    }
}
