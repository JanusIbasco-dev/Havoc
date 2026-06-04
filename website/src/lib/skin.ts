import type { LeaderboardPlayer } from "@/types/player";

type SkinResolverPlayer = Pick<
  LeaderboardPlayer,
  "uuid" | "username" | "platform" | "minecraftType" | "javaUuid" | "bedrockXuid" | "xuid" | "floodgateUuid" | "skinTextureUrl" | "skinUrl" | "skinTexture" | "skinTextureValue" | "skinProvider" | "skinModel" | "updatedAt"
>;

export type SkinSource = {
  url: string;
  kind: "skin" | "default";
  provider: NonNullable<LeaderboardPlayer["skinProvider"]>;
  model: "classic" | "slim";
};

export type PlayerBodyPreviewDebug = {
  username: string;
  skinTextureUrl: string | null;
  renderUrl: string;
  renderSource: string;
};

const defaultSteveSkin = "https://mc-heads.net/skin/MHF_Steve";
const defaultAlexSkin = "https://mc-heads.net/skin/MHF_Alex";

export function getPlayerHeadUrl(player: SkinResolverPlayer, size = 96) {
  const skinSource = getPlayerHeadSkinSource(player);
  const params = new URLSearchParams({
    src: skinSource,
    size: `${clampHeadSize(size)}`,
    v: player.updatedAt || `${Date.now()}`
  });

  return `/api/players/head?${params.toString()}`;
}

export function getPlayerBodyPreviewUrl(player: SkinResolverPlayer, size = 260) {
  return getPlayerBodyPreviewDebug(player, size).renderUrl;
}

export function getPlayerBodyPreviewDebug(player: SkinResolverPlayer, size = 260): PlayerBodyPreviewDebug {
  const rawSource = getPlayerBodyRenderSource(player);
  const renderIdentifier = rawSource ? renderIdentifierFromRawSkinSource(rawSource) : null;
  const fallbackIdentifier = defaultHeadIdentifier(player);
  const identifier = renderIdentifier || fallbackIdentifier;

  return {
    username: player.username,
    skinTextureUrl: player.skinTextureUrl || null,
    renderUrl: `https://mc-heads.net/body/${encodeURIComponent(identifier)}/${clampHeadSize(size)}.png`,
    renderSource: rawSource || `default:${fallbackIdentifier}`
  };
}

export function getPlayerSkinSource(player: SkinResolverPlayer): SkinSource {
  const provider = player.skinProvider || "unknown";
  const model = player.skinModel === "slim" ? "slim" : "classic";
  const storedSkin = usableUrl(player.skinUrl) || usableUrl(player.skinTexture) || skinUrlFromTextureValue(player.skinTextureValue);

  if (storedSkin) {
    return { url: normalizeSkinUrl(storedSkin), kind: "skin", provider, model };
  }

  const javaUuid = getJavaUuid(player);
  if (javaUuid) {
    return { url: `https://crafatar.com/skins/${encodeURIComponent(javaUuid)}`, kind: "skin", provider: provider === "unknown" ? "mojang" : provider, model };
  }

  return getDefaultSkin(player);
}

export function getSkinProviderLabel(player: Pick<LeaderboardPlayer, "skinProvider" | "skinUrl" | "skinTexture" | "skinTextureValue">) {
  if (player.skinProvider === "elyby") {
    return "Assigned Skin";
  }

  if (!player.skinUrl && !player.skinTexture && !player.skinTextureValue && (!player.skinProvider || player.skinProvider === "unknown")) {
    return "Default skin";
  }

  return null;
}

export function skinUrlFromTextureValue(textureValue?: string | null) {
  if (!textureValue) {
    return null;
  }

  try {
    const decoded = decodeBase64(textureValue);
    const parsed = JSON.parse(decoded) as { textures?: { SKIN?: { url?: unknown; metadata?: { model?: unknown } } } };
    const url = parsed.textures?.SKIN?.url;
    return typeof url === "string" ? url : null;
  } catch {
    return null;
  }
}

export function skinModelFromTextureValue(textureValue?: string | null): "classic" | "slim" | null {
  if (!textureValue) {
    return null;
  }

  try {
    const decoded = decodeBase64(textureValue);
    const parsed = JSON.parse(decoded) as { textures?: { SKIN?: { metadata?: { model?: unknown } } } };
    return parsed.textures?.SKIN?.metadata?.model === "slim" ? "slim" : "classic";
  } catch {
    return null;
  }
}

function getJavaUuid(player: SkinResolverPlayer) {
  const minecraftType = player.minecraftType || player.platform || "unknown";
  if (minecraftType === "bedrock" || minecraftType === "cracked") {
    return null;
  }

  const candidate = player.javaUuid || player.uuid;
  const normalized = candidate.replace(/-/g, "").trim();
  return /^[0-9a-fA-F]{32}$/.test(normalized) ? normalized : null;
}

function getFloodgateUuid(player: SkinResolverPlayer) {
  const candidate = player.floodgateUuid || player.uuid;
  const normalized = candidate.replace(/-/g, "").trim();
  return /^[0-9a-fA-F]{32}$/.test(normalized) ? normalized : null;
}

function defaultHeadIdentifier(player: SkinResolverPlayer) {
  const normalized = (player.javaUuid || player.uuid || player.bedrockXuid || player.xuid || "").replace(/-/g, "");
  const useAlex = normalized ? parseInt(normalized.slice(-1), 16) % 2 === 1 : false;
  return useAlex ? "MHF_Alex" : "MHF_Steve";
}

function getPlayerHeadSkinSource(player: SkinResolverPlayer) {
  const storedSkin = rawSkinUrl(player.skinTextureUrl) || rawSkinUrl(skinUrlFromTextureValue(player.skinTextureValue)) || rawSkinUrl(player.skinTexture) || rawSkinUrl(player.skinUrl);
  if (storedSkin) {
    return normalizeSkinUrl(storedSkin);
  }

  const javaUuid = getJavaUuid(player);
  if (javaUuid) {
    return `https://crafatar.com/skins/${encodeURIComponent(javaUuid)}`;
  }

  return `https://mc-heads.net/skin/${encodeURIComponent(player.username || defaultHeadIdentifier(player))}`;
}

function getPlayerBodyRenderSource(player: SkinResolverPlayer) {
  return rawSkinUrl(player.skinTextureUrl) || rawSkinUrl(skinUrlFromTextureValue(player.skinTextureValue)) || rawSkinUrl(player.skinTexture) || rawSkinUrl(player.skinUrl);
}

function renderIdentifierFromRawSkinSource(value: string) {
  if (value.startsWith("data:image/png;base64,")) {
    return null;
  }

  try {
    const parsed = new URL(value);
    const path = parsed.pathname;
    const host = parsed.hostname.toLowerCase();

    if (host === "textures.minecraft.net") {
      const match = path.match(/^\/texture\/([0-9a-fA-F]+)$/);
      return match?.[1] || null;
    }

    if (host === "crafatar.com") {
      const match = path.match(/^\/skins\/([0-9a-fA-F-]+)$/);
      return match?.[1]?.replace(/-/g, "") || null;
    }

    if (host === "mc-heads.net") {
      const match = path.match(/^\/skin\/([^/]+)$/);
      return match?.[1] ? decodeURIComponent(match[1]) : null;
    }
  } catch {
    return null;
  }

  return null;
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

function getDefaultSkin(player: SkinResolverPlayer): SkinSource {
  const normalized = (player.javaUuid || player.uuid || player.bedrockXuid || player.xuid || "").replace(/-/g, "");
  const useAlex = normalized ? parseInt(normalized.slice(-1), 16) % 2 === 1 : false;

  return {
    url: useAlex ? defaultAlexSkin : defaultSteveSkin,
    kind: "default",
    provider: player.skinProvider || "unknown",
    model: useAlex ? "slim" : "classic"
  };
}

function clampHeadSize(size: number) {
  return Math.min(600, Math.max(32, Math.round(size)));
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

function decodeBase64(value: string) {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(value);
  }

  return Buffer.from(value, "base64").toString("utf8");
}
