import { PlayerHeadAvatar, type PlayerHeadAvatarProps } from "@/components/PlayerHeadAvatar";

export type PlayerAvatarProps = PlayerHeadAvatarProps;

export function PlayerAvatar(props: PlayerAvatarProps) {
  return <PlayerHeadAvatar {...props} />;
}
