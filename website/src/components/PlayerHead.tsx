import { PlayerHeadAvatar } from "@/components/PlayerHeadAvatar";

type PlayerHeadProps = {
  username: string;
  uuid?: string;
  skinUrl?: string | null;
  skinProvider?: "mojang" | "elyby" | "offline" | "unknown";
  platform?: "java" | "bedrock";
  size?: "sm" | "md" | "lg";
};

export function PlayerHead({ size = "md", ...props }: PlayerHeadProps) {
  return <PlayerHeadAvatar {...props} size={size === "lg" ? "top3" : size === "sm" ? "small" : "table"} />;
}
