import { NextRequest } from "next/server";
import { unauthorized, badRequest, ok, serverError } from "@/lib/api-response";
import { isAuthorized } from "@/lib/auth";
import { bedrockXuidFromPayload, floodgateUuidFromPayload, javaUuidFromPayload, minecraftTypeFromPayload, platformFromPayload, playtimeFromPayload, requireString, seasonFromPayload, skinProviderFromPayload, skinTextureFromPayload, skinTextureSignatureFromPayload, skinTextureValueFromPayload, skinUrlFromPayload, xuidFromPayload } from "@/lib/payload";
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
      platform: platformFromPayload(payload),
      minecraftType: minecraftTypeFromPayload(payload),
      javaUuid: javaUuidFromPayload(payload),
      bedrockXuid: bedrockXuidFromPayload(payload),
      xuid: xuidFromPayload(payload),
      floodgateUuid: floodgateUuidFromPayload(payload),
      skinUrl: skinUrlFromPayload(payload),
      skinTexture: skinTextureFromPayload(payload),
      skinTextureValue: skinTextureValueFromPayload(payload),
      skinTextureSignature: skinTextureSignatureFromPayload(payload),
      skinProvider: skinProviderFromPayload(payload),
      playtimeHours: playtimeFromPayload(payload),
      season: seasonFromPayload(payload),
      firstJoin: typeof payload.firstJoin === "string" ? payload.firstJoin : typeof payload.firstJoinTimestamp === "string" ? payload.firstJoinTimestamp : undefined
    });

    return ok({ message: "Player registered." });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Unable to register player.");
  }
}
