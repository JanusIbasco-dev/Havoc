package dev.havoc.leaderboard.model;

public record SkinData(String textureValue, String signature, String skinUrl, String provider) {
    public boolean hasTexture() {
        return textureValue != null && !textureValue.isBlank();
    }

    public String fingerprint() {
        return "%s|%s|%s|%s".formatted(
                textureValue == null ? "" : textureValue,
                signature == null ? "" : signature,
                skinUrl == null ? "" : skinUrl,
                provider == null ? "" : provider
        );
    }
}
