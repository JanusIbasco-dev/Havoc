"use client";

import { useState } from "react";
import { getPlayerHeadUrl } from "@/lib/skin";

type PlayerHeadProps = {
  username: string;
  uuid?: string;
  skinUrl?: string | null;
  skinProvider?: "mojang" | "elyby" | "offline" | "unknown";
  platform?: "java" | "bedrock";
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-14 w-14",
  lg: "h-24 w-24"
};

export function PlayerHead({ username, uuid = "", skinUrl, skinProvider, platform, size = "md" }: PlayerHeadProps) {
  const [failed, setFailed] = useState(false);
  const source = getPlayerHeadUrl({ uuid, username, skinUrl, skinProvider, platform });

  if (source.url && source.kind === "texture" && !failed) {
    return (
      <div
        role="img"
        aria-label={`${username} head`}
        className={`${sizes[size]} border border-purple-400/35 bg-black shadow-[0_0_28px_rgba(139,92,246,0.24)] [image-rendering:pixelated]`}
      >
        <div
          className="relative h-full w-full bg-cover bg-no-repeat [image-rendering:pixelated]"
          style={{
            backgroundImage: `url("${source.url}")`,
            backgroundSize: "800% 800%",
            backgroundPosition: "14.2857% 14.2857%"
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-no-repeat [image-rendering:pixelated]"
            style={{
              backgroundImage: `url("${source.url}")`,
              backgroundSize: "800% 800%",
              backgroundPosition: "71.4286% 14.2857%"
            }}
          />
        </div>
        <img src={source.url} alt="" className="hidden" onError={() => setFailed(true)} />
      </div>
    );
  }

  if (source.url && source.kind === "render" && !failed) {
    return (
      <img
        src={source.url}
        alt={`${username} head`}
        onError={() => setFailed(true)}
        className={`${sizes[size]} border border-purple-400/35 bg-black object-cover shadow-[0_0_28px_rgba(139,92,246,0.24)] [image-rendering:pixelated]`}
      />
    );
  }

  return (
    <div
      aria-label={`${username} head unavailable`}
      className={`${sizes[size]} grid place-items-center border border-purple-400/35 bg-purple-950/35 text-sm font-black text-[var(--accent-strong)] shadow-[0_0_28px_rgba(139,92,246,0.24)]`}
    >
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}
