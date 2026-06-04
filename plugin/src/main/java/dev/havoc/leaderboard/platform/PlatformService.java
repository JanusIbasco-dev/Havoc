package dev.havoc.leaderboard.platform;

import dev.havoc.leaderboard.model.PlatformData;
import org.bukkit.entity.Player;

import java.lang.reflect.Method;
import java.util.UUID;

public final class PlatformService {
    private PlatformService() {
    }

    public static PlatformData from(Player player) {
        UUID uuid = player.getUniqueId();
        try {
            Class<?> apiClass = Class.forName("org.geysermc.floodgate.api.FloodgateApi");
            Object api = apiClass.getMethod("getInstance").invoke(null);
            Method isFloodgatePlayer = apiClass.getMethod("isFloodgatePlayer", UUID.class);
            boolean bedrock = Boolean.TRUE.equals(isFloodgatePlayer.invoke(api, uuid));
            if (!bedrock) {
                return PlatformData.javaPlayer();
            }

            Object floodgatePlayer = apiClass.getMethod("getPlayer", UUID.class).invoke(api, uuid);
            String xuid = valueFromMethod(floodgatePlayer, "getXuid");
            return new PlatformData("bedrock", xuid, uuid.toString());
        } catch (ReflectiveOperationException | LinkageError exception) {
            return PlatformData.javaPlayer();
        }
    }

    private static String valueFromMethod(Object target, String methodName) {
        if (target == null) {
            return null;
        }

        try {
            Object value = target.getClass().getMethod(methodName).invoke(target);
            return value == null ? null : value.toString();
        } catch (ReflectiveOperationException exception) {
            return null;
        }
    }
}
