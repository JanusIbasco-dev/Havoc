import { NextRequest } from "next/server";
import { unauthorized, badRequest, ok, serverError } from "@/lib/api-response";
import { isAuthorized } from "@/lib/auth";
import { floodgateUuidFromPayload, platformFromPayload, requireString, seasonFromPayload, skinProviderFromPayload, skinTextureSignatureFromPayload, skinTextureValueFromPayload, skinUrlFromPayload, xuidFromPayload } from "@/lib/payload";
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
      xuid: xuidFromPayload(payload),
      floodgateUuid: floodgateUuidFromPayload(payload),
      skinUrl: skinUrlFromPayload(payload),
      skinTextureValue: skinTextureValueFromPayload(payload),
      skinTextureSignature: skinTextureSignatureFromPayload(payload),
      skinProvider: skinProviderFromPayload(payload),
      season: seasonFromPayload(payload)
    });

    return ok({ message: "Skin updated." });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Unable to update skin.");
  }
}
