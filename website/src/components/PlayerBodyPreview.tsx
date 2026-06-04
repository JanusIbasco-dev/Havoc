import { getPlayerBodyPreviewDebug } from "@/lib/skin";
import type { LeaderboardPlayer } from "@/types/player";

type PlayerBodyPreviewPlayer = Pick<
  LeaderboardPlayer,
  "uuid" | "username" | "platform" | "minecraftType" | "javaUuid" | "bedrockXuid" | "xuid" | "floodgateUuid" | "skinTextureUrl" | "skinUrl" | "skinTexture" | "skinTextureValue" | "skinProvider" | "skinModel" | "updatedAt"
>;

type PlayerBodyPreviewProps = {
  player: PlayerBodyPreviewPlayer;
  size?: number;
  className?: string;
};

export function PlayerBodyPreview({ player, size = 260, className = "" }: PlayerBodyPreviewProps) {
  const debug = getPlayerBodyPreviewDebug(player, size);

  console.info("[PlayerBodyPreview]", {
    username: debug.username,
    skinTextureUrl: debug.skinTextureUrl,
    renderUrl: debug.renderUrl,
    renderSource: debug.renderSource
  });

  return <img src={debug.renderUrl} alt={`${player.username} Minecraft player preview`} className={className} width={size} height={size} />;
}
