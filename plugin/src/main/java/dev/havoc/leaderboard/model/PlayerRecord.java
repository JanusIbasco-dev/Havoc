package dev.havoc.leaderboard.model;

import java.util.UUID;

public final class PlayerRecord {
    private final UUID uuid;
    private String username;
    private String skinValue;
    private String skinSignature;
    private String skinUrl;
    private long firstJoinTimestamp;
    private int points;
    private int kills;
    private int deaths;

    public PlayerRecord(UUID uuid, String username, long firstJoinTimestamp) {
        this.uuid = uuid;
        this.username = username;
        this.firstJoinTimestamp = firstJoinTimestamp;
    }

    public UUID uuid() {
        return uuid;
    }

    public String username() {
        return username;
    }

    public void username(String username) {
        this.username = username;
    }

    public String skinValue() {
        return skinValue;
    }

    public void skinValue(String skinValue) {
        this.skinValue = skinValue;
    }

    public String skinSignature() {
        return skinSignature;
    }

    public void skinSignature(String skinSignature) {
        this.skinSignature = skinSignature;
    }

    public String skinUrl() {
        return skinUrl;
    }

    public void skinUrl(String skinUrl) {
        this.skinUrl = skinUrl;
    }

    public long firstJoinTimestamp() {
        return firstJoinTimestamp;
    }

    public void firstJoinTimestamp(long firstJoinTimestamp) {
        this.firstJoinTimestamp = firstJoinTimestamp;
    }

    public int points() {
        return points;
    }

    public void points(int points) {
        this.points = points;
    }

    public int kills() {
        return kills;
    }

    public void kills(int kills) {
        this.kills = kills;
    }

    public int deaths() {
        return deaths;
    }

    public void deaths(int deaths) {
        this.deaths = deaths;
    }
}
