package dev.havoc.leaderboard.skin;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import dev.havoc.leaderboard.model.SkinData;
import org.bukkit.entity.Player;
import org.bukkit.profile.PlayerProfile;
import org.bukkit.profile.PlayerTextures;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public final class SkinService {
    private SkinService() {
    }

    public static SkinData from(Player player) {
        PlayerProfile profile = player.getPlayerProfile();
        String skinUrl = skinUrlFromProfile(profile);
        return new SkinData(null, null, skinUrl);
    }

    private static String skinUrlFromProfile(PlayerProfile profile) {
        PlayerTextures textures = profile.getTextures();
        if (textures == null) {
            return null;
        }
        URL skin = textures.getSkin();
        return skin == null ? null : skin.toString();
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
            return skin.has("url") ? skin.get("url").getAsString() : null;
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
