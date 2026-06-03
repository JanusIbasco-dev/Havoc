import { NextRequest } from "next/server";
import { badRequest, ok, serverError, unauthorized } from "@/lib/api-response";
import { isAuthorized } from "@/lib/auth";
import { numberFromPayload, requireString, seasonFromPayload } from "@/lib/payload";
import { recordKillAndUpdatePlayers } from "@/lib/players";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return unauthorized();
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const killerUuid = requireString(payload, "killerUuid");
    const killerUsername = requireString(payload, "killerUsername");
    const victimUuid = requireString(payload, "victimUuid");
    const victimUsername = requireString(payload, "victimUsername");

    if (!killerUuid || !killerUsername || !victimUuid || !victimUsername) {
      return badRequest("killer and victim identity fields are required.");
    }

    const season = seasonFromPayload(payload);
    const timestamp = typeof payload.timestamp === "string" ? payload.timestamp : new Date().toISOString();
    const killer = await recordKillAndUpdatePlayers({
      killerUuid,
      killerUsername,
      victimUuid,
      victimUsername,
      pointsAwarded: numberFromPayload(payload, "pointsAwarded", 15),
      season,
      timestamp
    });

    return ok({ message: "Kill event recorded.", killer });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Unable to record kill event.");
  }
}
