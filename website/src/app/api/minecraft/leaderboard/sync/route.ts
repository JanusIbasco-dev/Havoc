import { NextRequest } from "next/server";
import { badRequest, ok, serverError, unauthorized } from "@/lib/api-response";
import { isAuthorized } from "@/lib/auth";
import { numberFromPayload, playtimeFromPayload, requireString, seasonFromPayload, skinUrlFromPayload } from "@/lib/payload";
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
        skinUrl: skinUrlFromPayload(player),
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
