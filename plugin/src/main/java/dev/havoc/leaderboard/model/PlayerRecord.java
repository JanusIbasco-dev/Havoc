package dev.havoc.leaderboard.model;

import java.util.UUID;

public final class PlayerRecord {
    private final UUID uuid;
    private String username;
    private String skinValue;
    private String skinSignature;
    private String skinUrl;
    private String skinProvider;
    private String platform = "java";
    private String xuid;
    private String floodgateUuid;
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

    public String skinProvider() {
        return skinProvider;
    }

    public void skinProvider(String skinProvider) {
        this.skinProvider = skinProvider;
    }

    public String platform() {
        return platform;
    }

    public void platform(String platform) {
        this.platform = platform;
    }

    public String xuid() {
        return xuid;
    }

    public void xuid(String xuid) {
        this.xuid = xuid;
    }

    public String floodgateUuid() {
        return floodgateUuid;
    }

    public void floodgateUuid(String floodgateUuid) {
        this.floodgateUuid = floodgateUuid;
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
