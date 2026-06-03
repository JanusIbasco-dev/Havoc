"use client";

import { useState } from "react";

type PlayerSkinRenderProps = {
  uuid: string;
  username: string;
  skinUrl?: string | null;
  compact?: boolean;
};

export function PlayerSkinRender({ uuid, username, skinUrl, compact = false }: PlayerSkinRenderProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const cleanUuid = uuid.replace(/-/g, "");
  const usableSkinUrl = typeof skinUrl === "string" && skinUrl.trim() ? skinUrl.trim() : null;
  const sources = [
    usableSkinUrl,
    `https://mc-heads.net/body/${encodeURIComponent(username)}/300`,
    `https://mc-heads.net/body/${encodeURIComponent(uuid)}/300`,
    `https://mc-heads.net/body/${encodeURIComponent(cleanUuid)}/300`,
    `https://crafatar.com/renders/body/${encodeURIComponent(cleanUuid)}?overlay=true&scale=8`
  ].filter(Boolean) as string[];
  const src = sources[sourceIndex];
  const renderFromTexture = usableSkinUrl && src === usableSkinUrl;

  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-500/12 to-black/20 ${compact ? "min-h-36" : "min-h-72"}`}>
      <div className={`absolute inset-x-8 rounded-full bg-purple-500/20 blur-3xl ${compact ? "top-8 h-20" : "top-12 h-32"}`} />
      {renderFromTexture ? (
        <TextureBody skinUrl={usableSkinUrl} username={username} compact={compact} onError={() => setSourceIndex((index) => index + 1)} />
      ) : src ? (
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

function TextureBody({ skinUrl, username, compact, onError }: { skinUrl: string; username: string; compact: boolean; onError: () => void }) {
  const scale = compact ? 4 : 7;

  return (
    <div className="relative flex flex-col items-center drop-shadow-[0_0_34px_rgba(139,92,246,0.45)]" style={{ width: 16 * scale, height: 32 * scale }}>
      <img src={skinUrl} alt="" className="hidden" onError={onError} />
      <SkinPart skinUrl={skinUrl} label={`${username} head`} x={8} y={8} w={8} h={8} scale={scale} className="z-10" />
      <div className="flex">
        <SkinPart skinUrl={skinUrl} label={`${username} right arm`} x={44} y={20} w={4} h={12} scale={scale} />
        <div className="flex flex-col">
          <SkinPart skinUrl={skinUrl} label={`${username} torso`} x={20} y={20} w={8} h={12} scale={scale} />
          <div className="flex">
            <SkinPart skinUrl={skinUrl} label={`${username} right leg`} x={4} y={20} w={4} h={12} scale={scale} />
            <SkinPart skinUrl={skinUrl} label={`${username} left leg`} x={20} y={52} w={4} h={12} scale={scale} />
          </div>
        </div>
        <SkinPart skinUrl={skinUrl} label={`${username} left arm`} x={36} y={52} w={4} h={12} scale={scale} />
      </div>
    </div>
  );
}

function SkinPart({
  skinUrl,
  label,
  x,
  y,
  w,
  h,
  scale,
  className = ""
}: {
  skinUrl: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`shrink-0 bg-no-repeat [image-rendering:pixelated] ${className}`}
      style={{
        width: w * scale,
        height: h * scale,
        backgroundImage: `url("${skinUrl}")`,
        backgroundSize: `${64 * scale}px ${64 * scale}px`,
        backgroundPosition: `-${x * scale}px -${y * scale}px`
      }}
    />
  );
}
