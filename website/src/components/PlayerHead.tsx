"use client";

import { useState } from "react";
import { getPlayerBodyRenderUrl } from "@/lib/skin";

type PlayerHeadProps = {
  username: string;
  uuid?: string;
  skinUrl?: string | null;
  skinProvider?: "mojang" | "elyby" | "offline" | "unknown";
  platform?: "java" | "bedrock";
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: {
    frame: "h-12 w-11",
    image: "h-[76px] w-[76px] translate-y-3 scale-[1.34]"
  },
  md: {
    frame: "h-16 w-14",
    image: "h-[96px] w-[96px] translate-y-4 scale-[1.34]"
  },
  lg: {
    frame: "h-28 w-24",
    image: "h-[164px] w-[164px] translate-y-7 scale-[1.3]"
  }
};

export function PlayerHead({ username, uuid = "", skinUrl, skinProvider, platform, size = "md" }: PlayerHeadProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const source = getPlayerBodyRenderUrl({ uuid, username, skinUrl, skinProvider, platform });
  const sources = source.url ? [source.url, "https://mc-heads.net/body/MHF_Steve/right"] : [];
  const url = sources[sourceIndex];
  const classes = sizes[size];

  if (url) {
    return (
      <div className={`${classes.frame} relative grid shrink-0 place-items-center overflow-hidden rounded-md border border-purple-400/35 bg-black/55 shadow-[0_0_28px_rgba(139,92,246,0.24)]`}>
        <div className="absolute bottom-1 h-4 w-10 rounded-full bg-purple-950/60 blur-sm" />
        <img
          src={url}
          alt={`${username} Minecraft character render`}
          onError={() => setSourceIndex((index) => index + 1)}
          className={`${classes.image} relative max-w-none object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.42)] [image-rendering:pixelated]`}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={`${username} character render unavailable`}
      className={`${classes.frame} grid shrink-0 place-items-center rounded-md border border-purple-400/35 bg-purple-950/35 text-sm font-black text-[var(--accent-strong)] shadow-[0_0_28px_rgba(139,92,246,0.24)]`}
    >
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}
