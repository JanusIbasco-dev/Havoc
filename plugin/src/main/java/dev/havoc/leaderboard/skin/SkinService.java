package dev.havoc.leaderboard.skin;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.destroystokyo.paper.profile.ProfileProperty;
import dev.havoc.leaderboard.model.SkinData;
import org.bukkit.entity.Player;
import org.bukkit.profile.PlayerProfile;
import org.bukkit.profile.PlayerTextures;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

public final class SkinService {
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2))
            .build();

    private SkinService() {
    }

    public static SkinData from(Player player, boolean elyByLookupEnabled) {
        com.destroystokyo.paper.profile.PlayerProfile profile = player.getPlayerProfile();
        ProfileProperty textureProperty = textureProperty(profile);
        String textureValue = textureProperty == null ? null : textureProperty.getValue();
        String signature = textureProperty == null ? null : textureProperty.getSignature();
        String skinUrl = skinUrlFromProfile(profile);

        if (skinUrl == null && textureValue != null) {
            skinUrl = skinUrlFromTextureValue(textureValue);
        }

        String provider = providerFor(player, skinUrl, textureValue, signature);
        if (elyByLookupEnabled && (skinUrl == null || "offline".equals(provider) || "unknown".equals(provider))) {
            String elySkinUrl = skinUrlFromElyBy(player.getName());
            if (elySkinUrl != null) {
                skinUrl = normalizeSkinUrl(elySkinUrl);
                provider = "elyby";
            }
        }

        return new SkinData(textureValue, signature, skinUrl, provider);
    }

    private static ProfileProperty textureProperty(com.destroystokyo.paper.profile.PlayerProfile profile) {
        for (ProfileProperty property : profile.getProperties()) {
            if ("textures".equals(property.getName())) {
                return property;
            }
        }
        return null;
    }

    private static String skinUrlFromProfile(PlayerProfile profile) {
        PlayerTextures textures = profile.getTextures();
        if (textures == null) {
            return null;
        }
        URL skin = textures.getSkin();
        return skin == null ? null : normalizeSkinUrl(skin.toString());
    }

    private static String skinUrlFromTextureValue(String textureValue) {
        try {
            String decoded = new String(Base64.getDecoder().decode(textureValue), StandardCharsets.UTF_8);
            JsonObject root = JsonParser.parseString(decoded).getAsJsonObject();
            JsonObject textures = root.getAsJsonObject("textures");
            if (textures == null || !textures.has("SKIN")) {
                return null;
            }
            JsonObject skin = textures.getAsJsonObject("SKIN");
            return skin.has("url") ? normalizeSkinUrl(skin.get("url").getAsString()) : null;
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private static String skinUrlFromElyBy(String username) {
        try {
            String encodedName = URLEncoder.encode(username, StandardCharsets.UTF_8);
            URI uri = URI.create("https://skinsystem.ely.by/textures/" + encodedName);
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(3))
                    .header("Accept", "application/json")
                    .GET()
                    .build();
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return null;
            }

            JsonObject root = JsonParser.parseString(response.body()).getAsJsonObject();
            if (!root.has("SKIN")) {
                return "https://skinsystem.ely.by/skins/" + encodedName + ".png";
            }

            JsonObject skin = root.getAsJsonObject("SKIN");
            return skin.has("url") ? normalizeSkinUrl(skin.get("url").getAsString()) : "https://skinsystem.ely.by/skins/" + encodedName + ".png";
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return null;
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private static String normalizeSkinUrl(String skinUrl) {
        return skinUrl == null ? null : skinUrl
                .replace("http://textures.minecraft.net/", "https://textures.minecraft.net/")
                .replace("http://ely.by/", "https://ely.by/");
    }

    private static String providerFor(Player player, String skinUrl, String textureValue, String signature) {
        if (skinUrl != null && skinUrl.contains("ely.by")) {
            return "elyby";
        }

        if ((signature != null && !signature.isBlank()) || (skinUrl != null && skinUrl.contains("textures.minecraft.net"))) {
            return "mojang";
        }

        if (!player.getServer().getOnlineMode()) {
            return "offline";
        }

        return textureValue == null && skinUrl == null ? "unknown" : "mojang";
    }
}
