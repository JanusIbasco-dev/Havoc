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
};

export function PlayerSkinRender({ uuid, username, skinUrl, skinProvider, platform, compact = false, podium = false, podiumSize = "contender" }: PlayerSkinRenderProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const primarySource = getPlayerBodyRenderUrl({ uuid, username, skinUrl, skinProvider, platform });
  const fallbackSources = primarySource.url ? [primarySource] : [];
  const source = fallbackSources[sourceIndex] || { url: null, kind: "placeholder" as const };
  const renderFromTexture = source.url && source.kind === "texture";
  const textureUrl = renderFromTexture ? source.url : null;
  const podiumChampion = podium && podiumSize === "champion";
  const frameClass = podium
    ? podiumChampion
      ? "h-[220px] w-[190px]"
      : "h-[178px] w-[160px]"
    : compact
      ? "min-h-24 rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-500/12 to-black/20"
      : "min-h-72 rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-500/12 to-black/20";

  return (
    <div className={`relative grid place-items-center overflow-hidden ${frameClass}`}>
      {podium ? <div className="absolute bottom-1 h-5 w-24 rounded-full bg-purple-950/38 blur-md" /> : <div className={`absolute inset-x-8 rounded-full bg-purple-500/20 blur-3xl ${compact ? "top-8 h-20" : "top-12 h-32"}`} />}
      {textureUrl ? (
        <TextureBody skinUrl={textureUrl} username={username} compact={compact} podium={podium} podiumSize={podiumSize} onError={() => setSourceIndex((index) => index + 1)} />
      ) : source.url && source.kind === "render" ? (
        <img
          src={source.url}
          alt={`${username} skin render`}
          onError={() => setSourceIndex((index) => index + 1)}
          className={`relative object-contain drop-shadow-[0_0_34px_rgba(139,92,246,0.45)] ${podium ? "h-full w-full" : compact ? "max-h-32" : "max-h-64"}`}
        />
      ) : (
        <div className={`relative grid w-full place-items-center p-4 text-center ${podium ? "h-full max-w-full rounded-lg border border-purple-300/18 bg-black/18" : "h-52 max-w-56 border border-purple-300/22 bg-black/34 shadow-[0_0_34px_rgba(139,92,246,0.18)]"}`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-100/42">Skin unavailable</p>
            <p className="mt-2 text-3xl font-black text-purple-100">{username.slice(0, 2).toUpperCase()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TextureBody({
  skinUrl,
  username,
  compact,
  podium,
  podiumSize,
  onError
}: {
  skinUrl: string;
  username: string;
  compact: boolean;
  podium: boolean;
  podiumSize: "champion" | "contender";
  onError: () => void;
}) {
  const scale = podium ? (podiumSize === "champion" ? 6 : 5) : compact ? 3 : 7;

  return (
    <div className="relative flex flex-col items-center drop-shadow-[0_0_34px_rgba(139,92,246,0.45)]" style={{ width: 16 * scale, height: 32 * scale }}>
      <img src={skinUrl} alt="" className="hidden" onError={onError} />
      <SkinPart skinUrl={skinUrl} label={`${username} head`} x={8} y={8} overlayX={40} overlayY={8} w={8} h={8} scale={scale} className="z-10" />
      <div className="flex">
        <SkinPart skinUrl={skinUrl} label={`${username} right arm`} x={44} y={20} overlayX={44} overlayY={36} w={4} h={12} scale={scale} />
        <div className="flex flex-col">
          <SkinPart skinUrl={skinUrl} label={`${username} torso`} x={20} y={20} overlayX={20} overlayY={36} w={8} h={12} scale={scale} />
          <div className="flex">
            <SkinPart skinUrl={skinUrl} label={`${username} right leg`} x={4} y={20} overlayX={4} overlayY={36} w={4} h={12} scale={scale} />
            <SkinPart skinUrl={skinUrl} label={`${username} left leg`} x={20} y={52} overlayX={4} overlayY={52} w={4} h={12} scale={scale} />
          </div>
        </div>
        <SkinPart skinUrl={skinUrl} label={`${username} left arm`} x={36} y={52} overlayX={52} overlayY={52} w={4} h={12} scale={scale} />
      </div>
    </div>
  );
}

function SkinPart({
  skinUrl,
  label,
  x,
  y,
  overlayX,
  overlayY,
  w,
  h,
  scale,
  className = ""
}: {
  skinUrl: string;
  label: string;
  x: number;
  y: number;
  overlayX?: number;
  overlayY?: number;
  w: number;
  h: number;
  scale: number;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative shrink-0 bg-no-repeat [image-rendering:pixelated] ${className}`}
      style={{
        width: w * scale,
        height: h * scale,
        backgroundImage: `url("${skinUrl}")`,
        backgroundSize: `${64 * scale}px ${64 * scale}px`,
        backgroundPosition: `-${x * scale}px -${y * scale}px`
      }}
    >
      {typeof overlayX === "number" && typeof overlayY === "number" ? (
        <div
          className="absolute inset-0 bg-no-repeat [image-rendering:pixelated]"
          style={{
            backgroundImage: `url("${skinUrl}")`,
            backgroundSize: `${64 * scale}px ${64 * scale}px`,
            backgroundPosition: `-${overlayX * scale}px -${overlayY * scale}px`
          }}
        />
      ) : null}
    </div>
  );
}
