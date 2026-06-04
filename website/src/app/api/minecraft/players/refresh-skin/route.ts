import { NextRequest } from "next/server";
import { unauthorized, badRequest, ok, serverError } from "@/lib/api-response";
import { isAuthorized } from "@/lib/auth";
import { bedrockXuidFromPayload, floodgateUuidFromPayload, javaUuidFromPayload, minecraftTypeFromPayload, platformFromPayload, requireString, seasonFromPayload, skinModelFromPayload, skinProviderFromPayload, skinTextureBase64FromPayload, skinTextureFromPayload, skinTextureSignatureFromPayload, skinTextureUrlFromPayload, skinTextureValueFromPayload, skinUrlFromPayload, texturesPropertyFromPayload, xuidFromPayload } from "@/lib/payload";
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
      skinTextureUrl: skinTextureUrlFromPayload(payload),
      skinUrl: skinUrlFromPayload(payload),
      skinTexture: skinTextureFromPayload(payload),
      skinTextureBase64: skinTextureBase64FromPayload(payload),
      texturesProperty: texturesPropertyFromPayload(payload),
      skinTextureValue: skinTextureValueFromPayload(payload),
      skinTextureSignature: skinTextureSignatureFromPayload(payload),
      skinProvider: skinProviderFromPayload(payload),
      skinModel: skinModelFromPayload(payload),
      season: seasonFromPayload(payload)
    });

    return ok({ message: "Skin refreshed." });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Unable to refresh skin.");
  }
}
