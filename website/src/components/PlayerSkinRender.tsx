"use client";

import { useState } from "react";

type PlayerSkinRenderProps = {
  uuid: string;
  username: string;
  skinUrl?: string | null;
  compact?: boolean;
};

export function PlayerSkinRender({ uuid, username, compact = false }: PlayerSkinRenderProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const cleanUuid = uuid.replace(/-/g, "");
  const sources = [
    `https://mc-heads.net/body/${encodeURIComponent(uuid)}/300`,
    `https://mc-heads.net/body/${encodeURIComponent(cleanUuid)}/300`,
    `https://crafatar.com/renders/body/${encodeURIComponent(cleanUuid)}?overlay=true&scale=8`
  ];
  const src = sources[sourceIndex];

  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-500/12 to-black/20 ${compact ? "min-h-36" : "min-h-72"}`}>
      <div className={`absolute inset-x-8 rounded-full bg-purple-500/20 blur-3xl ${compact ? "top-8 h-20" : "top-12 h-32"}`} />
      {src ? (
        <img
          src={src}
          alt={`${username} skin render`}
          onError={() => setSourceIndex((index) => index + 1)}
          className={`relative object-contain drop-shadow-[0_0_34px_rgba(139,92,246,0.45)] ${compact ? "max-h-32" : "max-h-64"}`}
        />
      ) : (
        <div className="relative grid h-52 w-full max-w-56 place-items-center border border-purple-300/22 bg-black/34 p-5 text-center shadow-[0_0_34px_rgba(139,92,246,0.18)]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-100/42">Skin unavailable</p>
            <p className="mt-2 text-3xl font-black text-purple-100">{username.slice(0, 2).toUpperCase()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
