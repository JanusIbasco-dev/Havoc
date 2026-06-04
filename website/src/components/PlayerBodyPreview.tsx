import { getPlayerBodyPreviewUrl } from "@/lib/skin";
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
  const src = getPlayerBodyPreviewUrl(player, size);

  return <img src={src} alt={`${player.username} Minecraft player preview`} className={className} width={size} height={size} />;
}
