package dev.havoc.leaderboard.model;

public record PlatformData(String platform, String xuid, String floodgateUuid) {
    public static PlatformData javaPlayer() {
        return new PlatformData("java", null, null);
    }
}
