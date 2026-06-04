import Link from "next/link";
import { PlayerSkinRender } from "@/components/PlayerSkinRender";
import type { LeaderboardPlayer } from "@/types/player";

type WarPodiumProps = {
  players: LeaderboardPlayer[];
  compact?: boolean;
};

const showcaseStyles = [
  {
    rank: "#1",
    label: "Champion",
    skinSize: "champion" as const,
    card: "min-h-[166px] border-yellow-300/42 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(25,18,34,0.88)_45%,rgba(8,6,14,0.94))] shadow-[0_0_28px_rgba(250,204,21,0.16),inset_0_1px_0_rgba(255,255,255,0.1)]",
    accent: "bg-yellow-300",
    rankText: "text-yellow-100",
    renderFrame: "h-[138px] w-[118px]"
  },
  {
    rank: "#2",
    label: "Runner Up",
    skinSize: "contender" as const,
    card: "min-h-[140px] border-slate-200/32 bg-[linear-gradient(135deg,rgba(226,232,240,0.1),rgba(21,18,31,0.86)_45%,rgba(8,6,14,0.94))] shadow-[0_0_22px_rgba(226,232,240,0.1),inset_0_1px_0_rgba(255,255,255,0.08)]",
    accent: "bg-slate-200",
    rankText: "text-slate-100",
    renderFrame: "h-[112px] w-[96px]"
  },
  {
    rank: "#3",
    label: "Elite",
    skinSize: "contender" as const,
    card: "min-h-[140px] border-orange-300/32 bg-[linear-gradient(135deg,rgba(251,146,60,0.1),rgba(26,18,25,0.86)_45%,rgba(8,6,14,0.94))] shadow-[0_0_22px_rgba(251,146,60,0.1),inset_0_1px_0_rgba(255,255,255,0.08)]",
    accent: "bg-orange-400",
    rankText: "text-orange-100",
    renderFrame: "h-[112px] w-[96px]"
  }
];

export function WarPodium({ players }: WarPodiumProps) {
  const entries = players.slice(0, 3).map((player, index) => ({
    player,
    style: showcaseStyles[index]
  }));

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full">
      <div className="relative grid gap-3">
        {entries.map(({ player, style }) => (
          <Link
            key={`${player.uuid}-${player.season}`}
            href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
            className={`group relative overflow-hidden rounded-xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:border-purple-300/45 hover:shadow-[0_0_30px_rgba(139,92,246,0.18)] ${style.card}`}
          >
            <div className={`absolute inset-y-0 left-0 w-1.5 ${style.accent}`} />
            <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-purple-500/10 blur-2xl transition group-hover:bg-purple-400/16" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-purple-300/18" />

            <div className="relative grid grid-cols-[minmax(0,1fr)_minmax(90px,118px)] items-center gap-4">
              <div className="min-w-0 py-1">
                <div className="flex items-center gap-2">
                  <span className={`grid h-9 min-w-12 place-items-center rounded-md border border-white/14 bg-black/30 px-2 text-lg font-black ${style.rankText}`}>
                    {style.rank}
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-purple-100/45">{style.label}</span>
                </div>
                <h3 className="mt-4 max-w-full truncate text-2xl font-black leading-tight text-white" title={player.username}>
                  {player.username}
                </h3>
                <p className="mt-1 text-base font-black text-purple-50/78">{player.points} Points</p>
              </div>

              <div className={`relative grid place-items-center overflow-hidden rounded-lg border border-purple-300/12 bg-black/20 ${style.renderFrame}`}>
                <div className="absolute bottom-1 h-6 w-20 rounded-full bg-purple-950/58 blur-md" />
                <div className="relative">
                  <PlayerSkinRender
                    uuid={player.uuid}
                    username={player.username}
                    skinUrl={player.skinUrl}
                    skinProvider={player.skinProvider}
                    platform={player.platform}
                    podium
                    podiumSize={style.skinSize}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
