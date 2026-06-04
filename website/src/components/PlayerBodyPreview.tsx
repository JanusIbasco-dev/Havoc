import { getPlayerSkinSource } from "@/lib/skin";
import type { LeaderboardPlayer } from "@/types/player";

type PlayerBodyPreviewPlayer = Pick<
  LeaderboardPlayer,
  "uuid" | "username" | "platform" | "minecraftType" | "javaUuid" | "bedrockXuid" | "xuid" | "floodgateUuid" | "skinUrl" | "skinTexture" | "skinTextureValue" | "skinProvider" | "skinModel"
>;

type PlayerBodyPreviewProps = {
  player: PlayerBodyPreviewPlayer;
  className?: string;
};

export function PlayerBodyPreview({ player, className = "" }: PlayerBodyPreviewProps) {
  const skin = getPlayerSkinSource(player);

  return <img src={skin.url} alt={`${player.username} Minecraft skin preview`} className={className} />;
}
