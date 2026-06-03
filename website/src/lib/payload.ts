export function skinUrlFromPayload(payload: Record<string, unknown>) {
  const directSkinUrl = payload.skinUrl;
  if (typeof directSkinUrl === "string" && isUsableSkinUrl(directSkinUrl)) {
    return directSkinUrl.trim();
  }

  const skin = payload.skin;
  if (skin && typeof skin === "object") {
    const nestedSkinUrl = (skin as { skinUrl?: unknown }).skinUrl;
    const textureValue = (skin as { textureValue?: unknown }).textureValue;
    if (typeof nestedSkinUrl === "string" && isUsableSkinUrl(nestedSkinUrl)) {
      return nestedSkinUrl.trim();
    }
    if (typeof textureValue === "string") {
      return skinUrlFromTextureValue(textureValue);
    }
  }

  return null;
}

function isUsableSkinUrl(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("https://") || trimmed.startsWith("http://");
}

function skinUrlFromTextureValue(textureValue: string) {
  try {
    const decoded = Buffer.from(textureValue, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as { textures?: { SKIN?: { url?: unknown } } };
    const url = parsed.textures?.SKIN?.url;
    return typeof url === "string" && isUsableSkinUrl(url) ? url.trim() : null;
  } catch {
    return null;
  }
}

export function seasonFromPayload(payload: Record<string, unknown>) {
  return resolveSeasonNumber(typeof payload.season === "string" || typeof payload.season === "number" ? payload.season : undefined);
}

export function requireString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export function numberFromPayload(payload: Record<string, unknown>, key: string, fallback = 0) {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function playtimeFromPayload(payload: Record<string, unknown>) {
  return numberFromPayload(payload, "playtimeHours", numberFromPayload(payload, "hoursOfGameplay"));
}
import { resolveSeasonNumber } from "@/lib/seasons";
