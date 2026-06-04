import type { LeaderboardPlayer } from "@/types/player";

type SkinSource = {
  url: string | null;
  kind: "render" | "placeholder";
  provider: NonNullable<LeaderboardPlayer["skinProvider"]>;
};

export function getPlayerHeadUrl(player: Pick<LeaderboardPlayer, "uuid" | "username" | "skinUrl" | "skinProvider" | "platform">): SkinSource {
  return getSkinSource(player);
}

export function getPlayerBodyRenderUrl(player: Pick<LeaderboardPlayer, "uuid" | "username" | "skinUrl" | "skinProvider" | "platform">): SkinSource {
  return getSkinSource(player);
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

function getSkinSource(player: Pick<LeaderboardPlayer, "uuid" | "username" | "skinUrl" | "skinProvider" | "platform">): SkinSource {
  const provider = player.skinProvider || "unknown";
  const identifier = getRenderIdentifier(player);

  if (!identifier) {
    return { url: null, kind: "placeholder", provider };
  }

  return { url: `https://mc-heads.net/body/${encodeURIComponent(identifier)}/right`, kind: "render", provider };
}

function getRenderIdentifier(player: Pick<LeaderboardPlayer, "uuid" | "username" | "skinUrl" | "skinProvider" | "platform">) {
  const normalizedUuid = player.uuid.replace(/-/g, "").trim();
  if (/^[0-9a-fA-F]{32}$/.test(normalizedUuid)) {
    return normalizedUuid;
  }

  const username = player.username.trim();
  if (username) {
    return username;
  }

  return null;
}
