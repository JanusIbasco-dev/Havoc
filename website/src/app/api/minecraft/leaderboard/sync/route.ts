import { NextRequest } from "next/server";
import { badRequest, ok, serverError, unauthorized } from "@/lib/api-response";
import { isAuthorized } from "@/lib/auth";
import { bedrockXuidFromPayload, floodgateUuidFromPayload, javaUuidFromPayload, minecraftTypeFromPayload, numberFromPayload, platformFromPayload, playtimeFromPayload, requireString, seasonFromPayload, skinProviderFromPayload, skinTextureFromPayload, skinTextureSignatureFromPayload, skinTextureValueFromPayload, skinUrlFromPayload, xuidFromPayload } from "@/lib/payload";
import { setPlayerStats } from "@/lib/players";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return unauthorized();
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const players = Array.isArray(payload.players) ? payload.players : [payload];

    for (const item of players) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const player = item as Record<string, unknown>;
      const uuid = requireString(player, "uuid");
      const username = requireString(player, "username");

      if (!uuid || !username) {
        return badRequest("Every synced player needs uuid and username.");
      }

      await setPlayerStats({
        uuid,
        username,
        platform: platformFromPayload(player),
        minecraftType: minecraftTypeFromPayload(player),
        javaUuid: javaUuidFromPayload(player),
        bedrockXuid: bedrockXuidFromPayload(player),
        xuid: xuidFromPayload(player),
        floodgateUuid: floodgateUuidFromPayload(player),
        skinUrl: skinUrlFromPayload(player),
        skinTexture: skinTextureFromPayload(player),
        skinTextureValue: skinTextureValueFromPayload(player),
        skinTextureSignature: skinTextureSignatureFromPayload(player),
        skinProvider: skinProviderFromPayload(player),
        kills: numberFromPayload(player, "kills"),
        deaths: numberFromPayload(player, "deaths"),
        points: numberFromPayload(player, "points"),
        playtimeHours: playtimeFromPayload(player),
        season: seasonFromPayload(player)
      });
    }

    return ok({ message: `Synced ${players.length} player(s).` });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Unable to sync leaderboard.");
  }
}
