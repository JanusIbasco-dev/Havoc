import { PlayerHeadAvatar } from "@/components/PlayerHeadAvatar";

type PlayerSkinRenderProps = {
  uuid: string;
  username: string;
  platform?: "java" | "bedrock";
  minecraftType?: "java" | "bedrock" | "cracked" | "unknown";
  javaUuid?: string | null;
  bedrockXuid?: string | null;
  xuid?: string | null;
  skinUrl?: string | null;
  skinTexture?: string | null;
  skinTextureValue?: string | null;
  skinProvider?: "mojang" | "elyby" | "offline" | "unknown";
  skinModel?: "classic" | "slim";
  compact?: boolean;
  podium?: boolean;
  podiumSize?: "champion" | "contender";
  mini?: boolean;
  renderSize?: "table" | "top3" | "profile" | "small";
};

export function PlayerSkinRender({ compact, podium, podiumSize, mini, renderSize, ...props }: PlayerSkinRenderProps) {
  const size = renderSize || (mini ? "table" : podium ? "top3" : "profile");
  return <PlayerHeadAvatar {...props} size={size} />;
}
