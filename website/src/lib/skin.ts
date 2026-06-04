import type { LeaderboardPlayer } from "@/types/player";

type SkinResolverPlayer = Pick<
  LeaderboardPlayer,
  "uuid" | "username" | "platform" | "minecraftType" | "javaUuid" | "bedrockXuid" | "xuid" | "skinUrl" | "skinTexture" | "skinTextureValue" | "skinProvider" | "skinModel"
>;

export type SkinSource = {
  url: string;
  kind: "skin" | "default";
  provider: NonNullable<LeaderboardPlayer["skinProvider"]>;
  model: "classic" | "slim";
};

const defaultSteveSkin = "https://mc-heads.net/skin/MHF_Steve";
const defaultAlexSkin = "https://mc-heads.net/skin/MHF_Alex";

export function getPlayerHeadUrl(player: SkinResolverPlayer): SkinSource {
  return getPlayerBodyRenderUrl(player);
}

export function getPlayerBodyRenderUrl(player: SkinResolverPlayer): SkinSource {
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
