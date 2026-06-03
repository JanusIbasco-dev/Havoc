"use client";

import { useState } from "react";

type PlayerHeadProps = {
  username: string;
  uuid?: string;
  skinUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-14 w-14",
  lg: "h-24 w-24"
};

export function PlayerHead({ username, uuid, size = "md" }: PlayerHeadProps) {
  const [failed, setFailed] = useState(false);
  const identifier = encodeURIComponent(uuid || username);
  const src = `https://mc-heads.net/avatar/${identifier}/100`;

  if (!failed) {
    return (
      <img
        src={src}
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
