import { NextRequest } from "next/server";
import { badRequest, ok, serverError, unauthorized } from "@/lib/api-response";
import { isAuthorized } from "@/lib/auth";
import { numberFromPayload, requireString, seasonFromPayload } from "@/lib/payload";
import { recordDeathAndUpdatePlayer } from "@/lib/players";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return unauthorized();
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const uuid = requireString(payload, "playerUuid") || requireString(payload, "uuid");
    const username = requireString(payload, "playerUsername") || requireString(payload, "username");

    if (!uuid || !username) {
      return badRequest("uuid and username are required.");
    }

    const season = seasonFromPayload(payload);
    const timestamp = typeof payload.timestamp === "string" ? payload.timestamp : new Date().toISOString();
    const player = await recordDeathAndUpdatePlayer({
      playerUuid: uuid,
      playerUsername: username,
      pointsDeducted: numberFromPayload(payload, "pointsDeducted", 13),
      season,
      timestamp
    });

    return ok({ message: "Death event recorded.", player });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Unable to record death event.");
  }
}
