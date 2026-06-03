import type { LeaderboardPlayer } from "@/types/player";

type SkinSource = {
  url: string | null;
  kind: "texture" | "render" | "placeholder";
  provider: NonNullable<LeaderboardPlayer["skinProvider"]>;
};

export function getPlayerHeadUrl(player: Pick<LeaderboardPlayer, "uuid" | "username" | "skinUrl" | "skinProvider">): SkinSource {
  return getSkinSource(player, "head");
}

export function getPlayerBodyRenderUrl(player: Pick<LeaderboardPlayer, "uuid" | "username" | "skinUrl" | "skinProvider">): SkinSource {
  return getSkinSource(player, "body");
}

export function getSkinProviderLabel(player: Pick<LeaderboardPlayer, "skinProvider" | "skinUrl">) {
  if (player.skinProvider === "elyby") {
    return "Ely.by Skin";
  }

  if (!player.skinUrl && (!player.skinProvider || player.skinProvider === "unknown")) {
    return "Skin unavailable";
  }

  return null;
}

function getSkinSource(player: Pick<LeaderboardPlayer, "uuid" | "username" | "skinUrl" | "skinProvider">, type: "head" | "body"): SkinSource {
  const provider = player.skinProvider || "unknown";
  const storedSkinUrl = usableUrl(player.skinUrl);

  if (storedSkinUrl) {
    return { url: normalizeSkinUrl(storedSkinUrl), kind: "texture", provider };
  }

  const elySkinUrl = player.username.trim() ? `https://skinsystem.ely.by/skins/${encodeURIComponent(player.username)}.png` : null;
  if (provider === "elyby" || provider === "offline" || provider === "unknown") {
    return { url: elySkinUrl, kind: "texture", provider: provider === "unknown" ? "elyby" : provider };
  }

  if (provider === "mojang" && isLikelyPremiumUuid(player.uuid)) {
    const cleanUuid = player.uuid.replace(/-/g, "");
    const path = type === "head" ? "avatar" : "body";
    const size = type === "head" ? "100" : "300";
    return { url: `https://mc-heads.net/${path}/${encodeURIComponent(cleanUuid)}/${size}`, kind: "render", provider };
  }

  return { url: null, kind: "placeholder", provider };
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
  return trimmed.startsWith("https://") || trimmed.startsWith("http://") ? trimmed : null;
}

function isLikelyPremiumUuid(uuid: string) {
  const normalized = uuid.replace(/-/g, "");
  return /^[0-9a-fA-F]{32}$/.test(normalized) && normalized[12] !== "3";
}
