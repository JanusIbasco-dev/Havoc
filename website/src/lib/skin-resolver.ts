import { skinModelFromTextureValue, skinUrlFromTextureValue } from "@/lib/skin";
import type { LeaderboardPlayer } from "@/types/player";

export type SkinResolverPlayer = Pick<
  LeaderboardPlayer,
  | "uuid"
  | "username"
  | "platform"
  | "minecraftType"
  | "javaUuid"
  | "bedrockXuid"
  | "xuid"
  | "floodgateUuid"
  | "skinTextureUrl"
  | "skinUrl"
  | "skinTexture"
  | "skinTextureBase64"
  | "texturesProperty"
  | "skinTextureValue"
  | "skinTextureSignature"
  | "skinProvider"
  | "skinModel"
>;

export type ResolvedSkin = {
  skinUrl: string;
  skinTextureUrl: string;
  skinTextureBase64?: string;
  texturesProperty?: string;
  skinTextureValue?: string;
  skinTextureSignature?: string;
  skinModel: "classic" | "slim";
  skinProvider: NonNullable<LeaderboardPlayer["skinProvider"]>;
  minecraftType: NonNullable<LeaderboardPlayer["minecraftType"]>;
  fallbackUsed: boolean;
  skinResolveError?: string | null;
  lastSkinResolvedAt: string;
};

const defaultSteveSkin = "https://mc-heads.net/skin/MHF_Steve";
const defaultAlexSkin = "https://mc-heads.net/skin/MHF_Alex";

export async function resolvePlayerSkin(player: SkinResolverPlayer): Promise<ResolvedSkin> {
  const resolvedAt = new Date().toISOString();

  const saved = resolveSavedSkin(player, resolvedAt);
  if (saved) {
    return saved;
  }

  const javaUuid = normalizeUuid(player.javaUuid || "");
  if (javaUuid) {
    const mojang = await fetchMojangSkinByUuid(javaUuid, player, resolvedAt);
    if (mojang) {
      return mojang;
    }
  }

  const mojangUuid = await resolveMojangUuidFromUsername(player);
  if (mojangUuid) {
    const mojang = await fetchMojangSkinByUuid(mojangUuid, player, resolvedAt);
    if (mojang) {
      return mojang;
    }
  }

  const bedrockXuid = (player.bedrockXuid || player.xuid || "").trim();
  if (bedrockXuid) {
    const bedrock = await fetchBedrockSkin(bedrockXuid, player, resolvedAt);
    if (bedrock) {
      return bedrock;
    }
  }

  const elyBy = await fetchElyBySkin(player, resolvedAt);
  if (elyBy) {
    return elyBy;
  }

  const offline = await fetchConfiguredOfflineSkin(player, resolvedAt);
  if (offline) {
    return offline;
  }

  return getDefaultResolvedSkin(player, resolvedAt, "No valid skin source found.");
}

function resolveSavedSkin(player: SkinResolverPlayer, resolvedAt: string): ResolvedSkin | null {
  const textureValue = firstString(player.texturesProperty, player.skinTextureBase64, player.skinTextureValue);
  const textureSkinUrl = skinUrlFromTextureValue(textureValue);
  const textureModel = skinModelFromTextureValue(textureValue);
  const directTextureUrl = rawSkinUrl(player.skinTextureUrl) || rawSkinUrl(player.skinTexture);
  const manualSkinUrl = rawSkinUrl(player.skinUrl);
  const skinUrl = textureSkinUrl || directTextureUrl || manualSkinUrl;

  if (!skinUrl) {
    return null;
  }

  const provider = player.skinProvider && player.skinProvider !== "unknown" ? player.skinProvider : manualSkinUrl ? "manual" : inferSavedProvider(player);

  return {
    skinUrl: normalizeSkinUrl(skinUrl),
    skinTextureUrl: normalizeSkinUrl(directTextureUrl || textureSkinUrl || skinUrl),
    ...(textureValue ? { skinTextureBase64: textureValue, texturesProperty: textureValue, skinTextureValue: textureValue } : {}),
    ...(player.skinTextureSignature ? { skinTextureSignature: player.skinTextureSignature } : {}),
    skinModel: textureModel ?? player.skinModel ?? "classic",
    skinProvider: provider,
    minecraftType: inferMinecraftType(player),
    fallbackUsed: false,
    skinResolveError: null,
    lastSkinResolvedAt: resolvedAt
  };
}

async function fetchMojangSkinByUuid(uuid: string, player: SkinResolverPlayer, resolvedAt: string): Promise<ResolvedSkin | null> {
  try {
    const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${encodeURIComponent(uuid)}?unsigned=false`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { properties?: Array<{ name?: unknown; value?: unknown; signature?: unknown }> };
    const textures = payload.properties?.find((property) => property.name === "textures");
    if (typeof textures?.value !== "string") {
      return null;
    }

    const skinUrl = skinUrlFromTextureValue(textures.value);
    if (!skinUrl) {
      return null;
    }

    return {
      skinUrl: normalizeSkinUrl(skinUrl),
      skinTextureUrl: normalizeSkinUrl(skinUrl),
      skinTextureBase64: textures.value,
      texturesProperty: textures.value,
      skinTextureValue: textures.value,
      ...(typeof textures.signature === "string" ? { skinTextureSignature: textures.signature } : {}),
      skinModel: skinModelFromTextureValue(textures.value) ?? player.skinModel ?? "classic",
      skinProvider: "mojang",
      minecraftType: "java",
      fallbackUsed: false,
      skinResolveError: null,
      lastSkinResolvedAt: resolvedAt
    };
  } catch {
    return null;
  }
}

async function resolveMojangUuidFromUsername(player: SkinResolverPlayer) {
  if (!canUseMojangUsernameLookup(player)) {
    return null;
  }

  try {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(player.username)}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { id?: unknown };
    const mojangUuid = typeof payload.id === "string" ? normalizeUuid(payload.id) : null;
    const savedUuid = normalizeUuid(player.uuid);
    return mojangUuid && (!savedUuid || savedUuid === mojangUuid) ? mojangUuid : null;
  } catch {
    return null;
  }
}

async function fetchBedrockSkin(xuid: string, player: SkinResolverPlayer, resolvedAt: string): Promise<ResolvedSkin | null> {
  try {
    const response = await fetch(`https://api.geysermc.org/v2/skin/${encodeURIComponent(xuid)}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { value?: unknown; is_steve?: unknown };
    if (typeof payload.value !== "string" || !payload.value.trim()) {
      return null;
    }

    const skinUrl = skinUrlFromTextureValue(payload.value);
    if (!skinUrl) {
      return null;
    }

    return {
      skinUrl: normalizeSkinUrl(skinUrl),
      skinTextureUrl: normalizeSkinUrl(skinUrl),
      skinTextureBase64: payload.value,
      texturesProperty: payload.value,
      skinTextureValue: payload.value,
      skinModel: payload.is_steve === false ? "slim" : player.skinModel ?? "classic",
      skinProvider: player.floodgateUuid ? "floodgate" : "bedrock",
      minecraftType: "bedrock",
      fallbackUsed: false,
      skinResolveError: null,
      lastSkinResolvedAt: resolvedAt
    };
  } catch {
    return null;
  }
}

async function fetchElyBySkin(player: SkinResolverPlayer, resolvedAt: string): Promise<ResolvedSkin | null> {
  if (!canUseElyByLookup(player)) {
    return null;
  }

  try {
    const response = await fetch(`https://skinsystem.ely.by/textures/signed/${encodeURIComponent(player.username)}`, { cache: "no-store" });
    if (response.status === 204 || response.status === 404 || !response.ok) {
      return null;
    }

    const payload = (await response.json()) as { properties?: Array<{ name?: unknown; value?: unknown; signature?: unknown }> };
    const textures = payload.properties?.find((property) => property.name === "textures");
    if (typeof textures?.value !== "string") {
      return null;
    }

    const skinUrl = skinUrlFromTextureValue(textures.value);
    if (!skinUrl) {
      return null;
    }

    return {
      skinUrl: normalizeSkinUrl(skinUrl),
      skinTextureUrl: normalizeSkinUrl(skinUrl),
      skinTextureBase64: textures.value,
      texturesProperty: textures.value,
      skinTextureValue: textures.value,
      ...(typeof textures.signature === "string" ? { skinTextureSignature: textures.signature } : {}),
      skinModel: skinModelFromTextureValue(textures.value) ?? player.skinModel ?? "classic",
      skinProvider: "elyby",
      minecraftType: inferMinecraftType(player) === "unknown" ? "cracked" : inferMinecraftType(player),
      fallbackUsed: false,
      skinResolveError: null,
      lastSkinResolvedAt: resolvedAt
    };
  } catch {
    return null;
  }
}

async function fetchConfiguredOfflineSkin(player: SkinResolverPlayer, resolvedAt: string): Promise<ResolvedSkin | null> {
  const template = process.env.OFFLINE_SKIN_PROVIDER_URL || process.env.LAUNCHER_SKIN_PROVIDER_URL || process.env.NEXT_PUBLIC_OFFLINE_SKIN_PROVIDER_URL;
  if (!template || !canUseOfflineLookup(player)) {
    return null;
  }

  try {
    const response = await fetch(expandSkinProviderTemplate(template, player), { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      const skinUrl = normalizeSkinUrl(response.url);
      return {
        skinUrl,
        skinTextureUrl: skinUrl,
        skinModel: player.skinModel ?? "classic",
        skinProvider: "offline",
        minecraftType: inferMinecraftType(player) === "unknown" ? "offline" : inferMinecraftType(player),
        fallbackUsed: false,
        skinResolveError: null,
        lastSkinResolvedAt: resolvedAt
      };
    }

    const payload = (await response.json()) as { skinUrl?: unknown; url?: unknown; skinTexture?: unknown; textureUrl?: unknown; textureValue?: unknown; skinTextureValue?: unknown; model?: unknown };
    const textureValue = typeof payload.skinTextureValue === "string" ? payload.skinTextureValue : typeof payload.textureValue === "string" ? payload.textureValue : null;
    const skinUrl = firstString(
      typeof payload.skinUrl === "string" ? payload.skinUrl : null,
      typeof payload.url === "string" ? payload.url : null,
      typeof payload.skinTexture === "string" ? payload.skinTexture : null,
      typeof payload.textureUrl === "string" ? payload.textureUrl : null,
      skinUrlFromTextureValue(textureValue)
    );

    if (!skinUrl || !rawSkinUrl(skinUrl)) {
      return null;
    }

    return {
      skinUrl: normalizeSkinUrl(skinUrl),
      skinTextureUrl: normalizeSkinUrl(skinUrl),
      ...(textureValue ? { skinTextureBase64: textureValue, texturesProperty: textureValue, skinTextureValue: textureValue } : {}),
      skinModel: payload.model === "slim" || skinModelFromTextureValue(textureValue) === "slim" ? "slim" : player.skinModel ?? "classic",
      skinProvider: "offline",
      minecraftType: inferMinecraftType(player) === "unknown" ? "offline" : inferMinecraftType(player),
      fallbackUsed: false,
      skinResolveError: null,
      lastSkinResolvedAt: resolvedAt
    };
  } catch {
    return null;
  }
}

function getDefaultResolvedSkin(player: SkinResolverPlayer, resolvedAt: string, error: string): ResolvedSkin {
  const skinUrl = defaultSkinUrl(player);
  return {
    skinUrl,
    skinTextureUrl: skinUrl,
    skinModel: defaultSkinModel(player),
    skinProvider: "default",
    minecraftType: inferMinecraftType(player),
    fallbackUsed: true,
    skinResolveError: error,
    lastSkinResolvedAt: resolvedAt
  };
}

export function defaultSkinUrl(player: SkinResolverPlayer) {
  return defaultSkinModel(player) === "slim" ? defaultAlexSkin : defaultSteveSkin;
}

function defaultSkinModel(player: SkinResolverPlayer) {
  const normalized = (player.javaUuid || player.uuid || player.bedrockXuid || player.xuid || "").replace(/-/g, "");
  return normalized && parseInt(normalized.slice(-1), 16) % 2 === 1 ? "slim" : "classic";
}

export function inferMinecraftType(player: SkinResolverPlayer): NonNullable<LeaderboardPlayer["minecraftType"]> {
  if (player.minecraftType === "java" || player.minecraftType === "bedrock" || player.minecraftType === "cracked" || player.minecraftType === "offline") {
    return player.minecraftType;
  }

  if (player.platform === "bedrock" || player.username.startsWith(".") || player.username.startsWith("*") || player.bedrockXuid || player.xuid || player.floodgateUuid) {
    return "bedrock";
  }

  if (player.platform === "java") {
    return "java";
  }

  return "unknown";
}

function inferSavedProvider(player: SkinResolverPlayer): NonNullable<LeaderboardPlayer["skinProvider"]> {
  const minecraftType = inferMinecraftType(player);
  if (minecraftType === "bedrock") {
    return player.floodgateUuid ? "floodgate" : "bedrock";
  }

  if (minecraftType === "cracked" || minecraftType === "offline") {
    return "offline";
  }

  return "manual";
}

function canUseMojangUsernameLookup(player: SkinResolverPlayer) {
  const minecraftType = inferMinecraftType(player);
  const username = player.username.trim();
  if (minecraftType === "bedrock" || minecraftType === "cracked" || minecraftType === "offline" || username.startsWith(".") || username.startsWith("*")) {
    return false;
  }

  return player.platform === "java" || minecraftType === "java" || minecraftType === "unknown";
}

function canUseElyByLookup(player: SkinResolverPlayer) {
  const minecraftType = inferMinecraftType(player);
  return player.skinProvider === "elyby" || minecraftType === "cracked" || minecraftType === "offline" || minecraftType === "unknown";
}

function canUseOfflineLookup(player: SkinResolverPlayer) {
  const minecraftType = inferMinecraftType(player);
  return player.skinProvider === "offline" || minecraftType === "cracked" || minecraftType === "offline" || minecraftType === "unknown";
}

function expandSkinProviderTemplate(template: string, player: SkinResolverPlayer) {
  const values: Record<string, string> = {
    username: player.username,
    uuid: player.uuid,
    javaUuid: player.javaUuid || "",
    bedrockXuid: player.bedrockXuid || player.xuid || "",
    xuid: player.xuid || player.bedrockXuid || ""
  };

  return template.replace(/\{(username|uuid|javaUuid|bedrockXuid|xuid)\}/g, (_, key: string) => encodeURIComponent(values[key] || ""));
}

function rawSkinUrl(value?: string | null) {
  const url = usableUrl(value);
  if (!url) {
    return null;
  }

  if (url.startsWith("data:image/png;base64,")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const host = parsed.hostname.toLowerCase();

    if (path.includes("/body") || path.includes("/bust") || path.includes("/full") || path.includes("/render") || path.includes("/avatar") || path.includes("/head")) {
      return null;
    }

    if (host === "textures.minecraft.net" && path.startsWith("/texture/")) {
      return url;
    }

    if (host === "crafatar.com" && path.startsWith("/skins/")) {
      return url;
    }

    if (host === "mc-heads.net" && path.startsWith("/skin/")) {
      return url;
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeUuid(value?: string | null) {
  const normalized = (value || "").replace(/-/g, "").trim();
  return /^[0-9a-fA-F]{32}$/.test(normalized) ? normalized : null;
}

function normalizeSkinUrl(value: string) {
  return value
    .replace(/^http:\/\/textures\.minecraft\.net\//, "https://textures.minecraft.net/")
    .replace(/^http:\/\/ely\.by\//, "https://ely.by/");
}

function usableUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.startsWith("https://") || trimmed.startsWith("http://") || trimmed.startsWith("data:image/") ? trimmed : null;
}

function firstString(...values: Array<string | null | undefined>) {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() || null;
}
