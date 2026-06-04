package dev.havoc.leaderboard.model;

public record SkinData(String textureValue, String signature, String skinUrl, String textureUrl, String model, String provider) {
    public boolean hasTexture() {
        return (textureValue != null && !textureValue.isBlank()) || (textureUrl != null && !textureUrl.isBlank());
    }

    public String fingerprint() {
        return "%s|%s|%s|%s|%s|%s".formatted(
                textureValue == null ? "" : textureValue,
                signature == null ? "" : signature,
                skinUrl == null ? "" : skinUrl,
                textureUrl == null ? "" : textureUrl,
                model == null ? "" : model,
                provider == null ? "" : provider
        );
    }
}
