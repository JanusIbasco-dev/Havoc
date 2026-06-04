"use client";

import { useState } from "react";
import { getPlayerBodyRenderUrl } from "@/lib/skin";

type PlayerSkinRenderProps = {
  uuid: string;
  username: string;
  skinUrl?: string | null;
  skinProvider?: "mojang" | "elyby" | "offline" | "unknown";
  platform?: "java" | "bedrock";
  compact?: boolean;
  podium?: boolean;
  podiumSize?: "champion" | "contender";
  mini?: boolean;
};

export function PlayerSkinRender({ uuid, username, skinUrl, skinProvider, platform, compact = false, podium = false, podiumSize = "contender", mini = false }: PlayerSkinRenderProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const primarySource = getPlayerBodyRenderUrl({ uuid, username, skinUrl, skinProvider, platform });
  const fallbackSources = primarySource.url ? [primarySource, { url: "https://mc-heads.net/body/MHF_Steve/right", kind: "render" as const, provider: "unknown" as const }] : [];
  const source = fallbackSources[sourceIndex] || { url: null, kind: "placeholder" as const };
  const podiumChampion = podium && podiumSize === "champion";
  const frameClass = mini
    ? "h-16 w-14"
    : podium
    ? podiumChampion
      ? "h-[132px] w-[112px]"
      : "h-[108px] w-[92px]"
    : compact
      ? "min-h-24 rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-500/12 to-black/20"
      : "min-h-72 rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-500/12 to-black/20";
  const imageClass = mini
    ? "h-[92px] w-[92px] translate-y-2 scale-[1.38]"
    : podium
      ? podiumChampion
        ? "h-[172px] w-[172px] translate-y-5 scale-[1.34]"
        : "h-[142px] w-[142px] translate-y-4 scale-[1.34]"
      : compact
        ? "h-[152px] w-[152px] translate-y-6 scale-[1.28]"
        : "h-[330px] w-[330px] translate-y-12 scale-[1.22]";

  return (
    <div className={`relative grid place-items-center overflow-hidden ${frameClass}`}>
      {podium || mini ? <div className="absolute bottom-1 h-5 w-20 rounded-full bg-purple-950/38 blur-md" /> : <div className={`absolute inset-x-8 rounded-full bg-purple-500/20 blur-3xl ${compact ? "top-8 h-20" : "top-12 h-32"}`} />}
      {source.url && source.kind === "render" ? (
        <img
          src={source.url}
          alt={`${username} Minecraft character render`}
          onError={() => setSourceIndex((index) => index + 1)}
          className={`relative max-w-none object-contain drop-shadow-[0_0_34px_rgba(139,92,246,0.45)] [image-rendering:pixelated] ${imageClass}`}
        />
      ) : (
        <div className={`relative grid w-full place-items-center p-4 text-center ${podium || mini ? "h-full max-w-full rounded-lg border border-purple-300/18 bg-black/18" : "h-52 max-w-56 border border-purple-300/22 bg-black/34 shadow-[0_0_34px_rgba(139,92,246,0.18)]"}`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-100/42">Skin unavailable</p>
            <p className="mt-2 text-3xl font-black text-purple-100">{username.slice(0, 2).toUpperCase()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
