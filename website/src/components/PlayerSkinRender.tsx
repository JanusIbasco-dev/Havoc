"use client";

import { useEffect, useRef, useState } from "react";
import { getPlayerBodyRenderUrl } from "@/lib/skin";

type PlayerSkinRenderProps = {
  uuid: string;
  username: string;
  platform?: "java" | "bedrock";
  minecraftType?: "java" | "bedrock" | "cracked" | "unknown";
  javaUuid?: string | null;
  bedrockXuid?: string | null;
  xuid?: string | null;
  skinUrl?: string | null;
  skinTexture?: string | null;
  skinTextureValue?: string | null;
  skinProvider?: "mojang" | "elyby" | "offline" | "unknown";
  skinModel?: "classic" | "slim";
  compact?: boolean;
  podium?: boolean;
  podiumSize?: "champion" | "contender";
  mini?: boolean;
  renderSize?: "table" | "top3" | "profile";
};

const fallbackSteve = "https://mc-heads.net/skin/MHF_Steve";

const renderStyles = {
  table: {
    frame: "h-14 w-14 rounded-md",
    canvas: 56,
    zoom: 2.15,
    y: -7.3
  },
  top3: {
    frame: "h-24 w-24 rounded-lg",
    canvas: 96,
    zoom: 2.12,
    y: -7.2
  },
  profile: {
    frame: "h-72 w-full rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-500/12 to-black/20",
    canvas: 288,
    zoom: 1.58,
    y: -5.7
  }
};

export function PlayerSkinRender({
  uuid,
  username,
  skinUrl,
  skinTexture,
  skinTextureValue,
  skinProvider,
  platform,
  minecraftType,
  javaUuid,
  bedrockXuid,
  xuid,
  skinModel,
  compact = false,
  podium = false,
  mini = false,
  renderSize
}: PlayerSkinRenderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const size = renderSize || (mini ? "table" : podium ? "top3" : "profile");
  const style = renderStyles[size];
  const source = getPlayerBodyRenderUrl({ uuid, username, skinUrl, skinTexture, skinTextureValue, skinProvider, platform, minecraftType, javaUuid, bedrockXuid, xuid, skinModel });
  const skin = failed ? fallbackSteve : source.url;
  const model = failed ? "classic" : source.model;
  const frameClass = compact && size === "profile" ? "h-28 w-full rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-500/12 to-black/20" : style.frame;

  useEffect(() => {
    setFailed(false);
  }, [source.url]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let disposed = false;
    let viewer: { dispose: () => void } | null = null;

    async function renderSkin() {
      const skinview3d = await import("skinview3d");
      if (disposed || !canvasRef.current) {
        return;
      }

      const currentCanvas = canvasRef.current;
      const skinViewer = new skinview3d.SkinViewer({
        canvas: currentCanvas,
        width: style.canvas,
        height: style.canvas,
        skin,
        model: model === "slim" ? "slim" : "default",
        fov: 35,
        zoom: style.zoom,
        enableControls: false
      });

      skinViewer.globalLight.intensity = 1.8;
      skinViewer.cameraLight.intensity = 0.65;
      skinViewer.playerObject.rotation.y = -0.42;
      skinViewer.playerObject.position.y = style.y;
      skinViewer.playerObject.skin.leftArm.rotation.z = -0.08;
      skinViewer.playerObject.skin.rightArm.rotation.z = 0.08;
      viewer = skinViewer;

      skinViewer.loadSkin(skin, { model: model === "slim" ? "slim" : "default" }).catch(() => {
        if (!disposed && !failed) {
          setFailed(true);
        }
      });
    }

    renderSkin().catch(() => {
      if (!disposed && !failed) {
        setFailed(true);
      }
    });

    return () => {
      disposed = true;
      viewer?.dispose();
    };
  }, [failed, model, skin, style.canvas, style.y, style.zoom]);

  return (
    <div className={`relative grid shrink-0 place-items-center overflow-hidden border border-purple-300/18 bg-[radial-gradient(circle_at_50%_18%,rgba(167,139,250,0.18),rgba(10,10,14,0.82)_58%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_24px_rgba(139,92,246,0.18)] ${frameClass}`}>
      <div className="absolute bottom-1 h-4/5 w-4/5 rounded-full bg-black/28 blur-md" />
      <canvas ref={canvasRef} aria-label={`${username} 3D Minecraft bust render`} className="relative h-full w-full [image-rendering:pixelated]" />
    </div>
  );
}
