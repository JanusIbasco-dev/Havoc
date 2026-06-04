"use client";

import { useEffect, useMemo, useState } from "react";
import { getPlayerHeadUrl } from "@/lib/skin";
import type { LeaderboardPlayer } from "@/types/player";

export type PlayerHeadAvatarSize = "table" | "top3" | "profile" | "small";

type PlayerHeadAvatarPlayer = Pick<
  LeaderboardPlayer,
  "uuid" | "username" | "platform" | "minecraftType" | "javaUuid" | "bedrockXuid" | "xuid" | "floodgateUuid" | "skinTextureUrl" | "skinUrl" | "skinTexture" | "skinTextureBase64" | "texturesProperty" | "skinTextureValue" | "skinProvider" | "skinModel" | "updatedAt"
>;

export type PlayerHeadAvatarProps = Partial<PlayerHeadAvatarPlayer> & {
  player?: PlayerHeadAvatarPlayer;
  size?: PlayerHeadAvatarSize | number;
  className?: string;
};

const avatarSizes: Record<PlayerHeadAvatarSize, { pixels: number; frame: string }> = {
  table: {
    pixels: 48,
    frame: "h-12 w-12 rounded-md"
  },
  small: {
    pixels: 72,
    frame: "h-[72px] w-[72px] rounded-lg"
  },
  top3: {
    pixels: 86,
    frame: "h-[86px] w-[86px] rounded-lg"
  },
  profile: {
    pixels: 96,
    frame: "h-24 w-24 rounded-xl"
  }
};

export function PlayerHeadAvatar({ player, size = "profile", className = "", ...props }: PlayerHeadAvatarProps) {
  const resolvedPlayer = useMemo(() => resolvePlayer(player, props), [player, props]);
  const numericSize = typeof size === "number" ? size : avatarSizes[size].pixels;
  const frameClass = typeof size === "number" ? "" : avatarSizes[size].frame;
  const [failed, setFailed] = useState(false);
  const headSource = useMemo(() => getPlayerHeadUrl(resolvedPlayer, numericSize), [numericSize, resolvedPlayer]);
  const imageClass = size === "profile" ? "profile-head-avatar block [image-rendering:pixelated]" : "block h-full w-full object-contain [image-rendering:pixelated]";
  const fallbackSource = useMemo(
    () =>
      getPlayerHeadUrl(
        {
          ...resolvedPlayer,
          username: resolvedPlayer.skinModel === "slim" ? "MHF_Alex" : "MHF_Steve",
          uuid: "",
          javaUuid: null,
          floodgateUuid: null,
          skinTextureUrl: null,
          skinUrl: null,
          skinTextureBase64: null,
          skinTexture: null,
          texturesProperty: null,
          skinTextureValue: null,
          skinProvider: "unknown",
          updatedAt: resolvedPlayer.updatedAt
        },
        numericSize
      ),
    [numericSize, resolvedPlayer]
  );
  const src = failed ? fallbackSource : headSource;

  useEffect(() => {
    setFailed(false);
  }, [headSource]);

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden border border-purple-300/20 bg-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_24px_rgba(139,92,246,0.18)] ${frameClass} ${className}`}
      style={typeof size === "number" ? { width: `${numericSize}px`, height: `${numericSize}px` } : undefined}
    >
      <img
        src={src}
        alt={`${resolvedPlayer.username} Minecraft head`}
        className={imageClass}
        width={numericSize}
        height={numericSize}
        onError={() => {
          if (!failed) {
            setFailed(true);
          }
        }}
      />
    </div>
  );
}

function resolvePlayer(player: PlayerHeadAvatarProps["player"], props: Partial<PlayerHeadAvatarPlayer>): PlayerHeadAvatarPlayer {
  return {
    uuid: player?.uuid || props.uuid || "",
    username: player?.username || props.username || "MHF_Steve",
    platform: player?.platform || props.platform,
    minecraftType: player?.minecraftType || props.minecraftType,
    javaUuid: player?.javaUuid ?? props.javaUuid,
    bedrockXuid: player?.bedrockXuid ?? props.bedrockXuid,
    xuid: player?.xuid ?? props.xuid,
    floodgateUuid: player?.floodgateUuid ?? props.floodgateUuid,
    skinTextureUrl: player?.skinTextureUrl ?? props.skinTextureUrl,
    skinUrl: player?.skinUrl ?? props.skinUrl,
    skinTextureBase64: player?.skinTextureBase64 ?? props.skinTextureBase64,
    skinTexture: player?.skinTexture ?? props.skinTexture,
    texturesProperty: player?.texturesProperty ?? props.texturesProperty,
    skinTextureValue: player?.skinTextureValue ?? props.skinTextureValue,
    skinProvider: player?.skinProvider || props.skinProvider,
    skinModel: player?.skinModel || props.skinModel,
    updatedAt: player?.updatedAt || props.updatedAt
  };
}
