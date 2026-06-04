import Link from "next/link";
import { PlayerSkinRender } from "@/components/PlayerSkinRender";
import type { LeaderboardPlayer } from "@/types/player";

type WarPodiumProps = {
  players: LeaderboardPlayer[];
  compact?: boolean;
};

const rankingStyles = [
  {
    rank: "#1",
    title: "Champion",
    accent: "from-yellow-300/24 via-yellow-200/10 to-transparent",
    strip: "bg-yellow-300",
    border: "border-yellow-300/36",
    glow: "shadow-[0_0_28px_rgba(250,204,21,0.14)]",
    text: "text-yellow-100"
  },
  {
    rank: "#2",
    title: "Runner Up",
    accent: "from-slate-200/20 via-slate-100/8 to-transparent",
    strip: "bg-slate-200",
    border: "border-slate-200/30",
    glow: "shadow-[0_0_26px_rgba(226,232,240,0.11)]",
    text: "text-slate-100"
  },
  {
    rank: "#3",
    title: "Elite",
    accent: "from-orange-300/20 via-orange-200/8 to-transparent",
    strip: "bg-orange-400",
    border: "border-orange-300/30",
    glow: "shadow-[0_0_26px_rgba(251,146,60,0.12)]",
    text: "text-orange-100"
  }
];

export function WarPodium({ players }: WarPodiumProps) {
  const entries = players.slice(0, 3);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="grid w-full gap-3">
      {entries.map((player, index) => {
        const style = rankingStyles[index];

        return (
          <Link
            key={`${player.uuid}-${player.season}`}
            href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
            className={`group relative grid h-[132px] w-full overflow-hidden rounded-lg border bg-[#0a090d]/86 transition duration-200 hover:-translate-y-0.5 hover:border-purple-300/45 ${style.border} ${style.glow}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${style.accent}`} />
            <div className={`absolute -left-5 top-0 h-full w-9 -skew-x-12 ${style.strip} opacity-90`} />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

            <div className="relative grid h-full grid-cols-[72px_minmax(0,1fr)_100px] items-center gap-2 px-4">
              <div className="grid gap-2">
                <span className={`grid h-11 min-w-12 place-items-center rounded-md border border-white/16 bg-black/38 px-2 text-lg font-black ${style.text}`}>
                  {style.rank}
                </span>
                <span className="text-[0.62rem] font-black uppercase leading-tight tracking-[0.12em] text-purple-100/50">{style.title}</span>
              </div>

              <div className="min-w-0">
                <h3 className="max-w-full break-words text-[clamp(0.98rem,1.75vw,1.18rem)] font-black leading-tight text-white" title={player.username}>
                  {player.username}
                </h3>
                <p className="mt-1 text-sm font-black text-purple-50/74">{player.points} Points</p>
              </div>

              <div className="flex justify-end">
                <PlayerSkinRender
                  uuid={player.uuid}
                  username={player.username}
                  skinUrl={player.skinUrl}
                  skinTexture={player.skinTexture}
                  skinTextureValue={player.skinTextureValue}
                  skinProvider={player.skinProvider}
                  platform={player.platform}
                  minecraftType={player.minecraftType}
                  javaUuid={player.javaUuid}
                  bedrockXuid={player.bedrockXuid}
                  xuid={player.xuid}
                  skinModel={player.skinModel}
                  renderSize="top3"
                />
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
