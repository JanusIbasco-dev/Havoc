export function skinUrlFromPayload(payload: Record<string, unknown>) {
  const directSkinUrl = payload.skinUrl;
  if (typeof directSkinUrl === "string" && isUsableSkinUrl(directSkinUrl)) {
    return normalizeSkinUrl(directSkinUrl);
  }

  const directTextureValue = payload.skinTextureValue;
  if (typeof directTextureValue === "string") {
    const url = skinUrlFromTextureValue(directTextureValue);
    if (url) {
      return url;
    }
  }

  const skin = payload.skin;
  if (skin && typeof skin === "object") {
    const nestedSkinUrl = (skin as { skinUrl?: unknown }).skinUrl;
    const textureValue = (skin as { textureValue?: unknown }).textureValue;
    if (typeof nestedSkinUrl === "string" && isUsableSkinUrl(nestedSkinUrl)) {
      return normalizeSkinUrl(nestedSkinUrl);
    }
    if (typeof textureValue === "string") {
      return skinUrlFromTextureValue(textureValue);
    }
  }

  return null;
}

export function skinTextureValueFromPayload(payload: Record<string, unknown>) {
  return stringFromPayload(payload, "skinTextureValue") || stringFromNestedSkin(payload, "textureValue");
}

export function skinTextureSignatureFromPayload(payload: Record<string, unknown>) {
  return stringFromPayload(payload, "skinTextureSignature") || stringFromNestedSkin(payload, "signature");
}

export function skinProviderFromPayload(payload: Record<string, unknown>) {
  const provider = stringFromPayload(payload, "skinProvider") || stringFromNestedSkin(payload, "provider");
  return provider === "mojang" || provider === "elyby" || provider === "offline" || provider === "unknown" ? provider : undefined;
}

export function platformFromPayload(payload: Record<string, unknown>) {
  const platform = stringFromPayload(payload, "platform");
  return platform === "bedrock" ? "bedrock" : platform === "java" ? "java" : undefined;
}

export function xuidFromPayload(payload: Record<string, unknown>) {
  return stringFromPayload(payload, "xuid");
}

export function floodgateUuidFromPayload(payload: Record<string, unknown>) {
  return stringFromPayload(payload, "floodgateUuid");
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
    return typeof url === "string" && isUsableSkinUrl(url) ? normalizeSkinUrl(url) : null;
  } catch {
    return null;
  }
}

function normalizeSkinUrl(value: string) {
  return value.trim()
    .replace(/^http:\/\/textures\.minecraft\.net\//, "https://textures.minecraft.net/")
    .replace(/^http:\/\/ely\.by\//, "https://ely.by/");
}

function stringFromPayload(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringFromNestedSkin(payload: Record<string, unknown>, key: string) {
  const skin = payload.skin;
  if (!skin || typeof skin !== "object") {
    return null;
  }

  const value = (skin as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
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
