export function skinUrlFromPayload(payload: Record<string, unknown>) {
  const directSkinUrl = payload.skinUrl;
  if (typeof directSkinUrl === "string") {
    return directSkinUrl;
  }

  const skin = payload.skin;
  if (skin && typeof skin === "object" && "skinUrl" in skin) {
    const nestedSkinUrl = (skin as { skinUrl?: unknown }).skinUrl;
    return typeof nestedSkinUrl === "string" ? nestedSkinUrl : null;
  }

  return null;
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
