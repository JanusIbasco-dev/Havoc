import { NextRequest } from "next/server";
import { unauthorized, badRequest, ok, serverError } from "@/lib/api-response";
import { isAuthorized } from "@/lib/auth";
import { numberFromPayload, playtimeFromPayload, requireString, seasonFromPayload, skinUrlFromPayload } from "@/lib/payload";
import { upsertPlayer } from "@/lib/players";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return unauthorized();
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const uuid = requireString(payload, "uuid");
    const username = requireString(payload, "username");

    if (!uuid || !username) {
      return badRequest("uuid and username are required.");
    }

    await upsertPlayer({
      uuid,
      username,
      skinUrl: skinUrlFromPayload(payload),
      kills: numberFromPayload(payload, "kills"),
      deaths: numberFromPayload(payload, "deaths"),
      points: numberFromPayload(payload, "points"),
      playtimeHours: playtimeFromPayload(payload),
      season: seasonFromPayload(payload),
      firstJoin: typeof payload.firstJoin === "string" ? payload.firstJoin : typeof payload.firstJoinTimestamp === "string" ? payload.firstJoinTimestamp : undefined
    });

    return ok({ message: "Player registered." });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Unable to register player.");
  }
}
