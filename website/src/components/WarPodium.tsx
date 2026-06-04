import Link from "next/link";
import { PlayerSkinRender } from "@/components/PlayerSkinRender";
import { PlatformBadge } from "@/components/PlatformBadge";
import type { LeaderboardPlayer } from "@/types/player";

type WarPodiumProps = {
  players: LeaderboardPlayer[];
  compact?: boolean;
};

const podiumStyles = [
  {
    rank: "#1",
    card: "min-h-[330px] border-yellow-300/55 bg-[linear-gradient(180deg,rgba(250,204,21,0.12),rgba(21,13,34,0.86))] shadow-[0_0_48px_rgba(250,204,21,0.24),inset_0_1px_0_rgba(255,255,255,0.12)]",
    accent: "from-yellow-200/22 via-purple-400/10 to-transparent",
    rankText: "text-yellow-100",
    badge: "border-yellow-200/40 bg-yellow-300/12",
    order: "md:order-2 md:-translate-y-6",
    width: "max-w-[370px]",
    skinSize: "champion" as const
  },
  {
    rank: "#2",
    card: "min-h-[290px] border-slate-200/38 bg-[linear-gradient(180deg,rgba(226,232,240,0.08),rgba(18,12,31,0.86))] shadow-[0_0_34px_rgba(226,232,240,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]",
    accent: "from-slate-100/18 via-purple-400/8 to-transparent",
    rankText: "text-slate-100",
    badge: "border-slate-100/32 bg-slate-100/10",
    order: "md:order-1",
    width: "max-w-[330px]",
    skinSize: "contender" as const
  },
  {
    rank: "#3",
    card: "min-h-[290px] border-orange-300/38 bg-[linear-gradient(180deg,rgba(251,146,60,0.08),rgba(18,12,31,0.86))] shadow-[0_0_34px_rgba(251,146,60,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]",
    accent: "from-orange-200/18 via-purple-400/8 to-transparent",
    rankText: "text-orange-100",
    badge: "border-orange-200/32 bg-orange-300/10",
    order: "md:order-3",
    width: "max-w-[330px]",
    skinSize: "contender" as const
  }
];

export function WarPodium({ players }: WarPodiumProps) {
  const entries = players.slice(0, 3).map((player, index) => ({
    player,
    style: podiumStyles[index]
  }));

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className={podiumGridClass(entries.length)}>
        {entries.map(({ player, style }) => (
          <Link
            key={`${player.uuid}-${player.season}`}
            href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
            className={`group relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border px-5 py-5 text-center backdrop-blur-md transition duration-200 hover:-translate-y-1 ${style.width} ${style.card} ${style.order}`}
          >
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${style.accent}`} />

            <div className="relative flex justify-center">
              <span className={`grid h-11 min-w-16 place-items-center rounded-lg border px-3 text-2xl font-black leading-none ${style.rankText} ${style.badge}`}>
                {style.rank}
              </span>
            </div>

            <div className="relative mt-4 flex flex-1 items-center justify-center">
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

            <div className="relative mt-4 min-w-0">
              <div className="mx-auto max-w-full min-w-0">
                <h3 className="mx-auto w-full truncate text-2xl font-black leading-tight text-white" title={player.username}>
                  {player.username}
                </h3>
              </div>
              <div className="mt-2 flex justify-center">
                <PlatformBadge platform={player.platform} compact />
              </div>
              <p className="mt-3 truncate text-sm font-black text-purple-50/78">
                {player.points} pts <span className="mx-1 text-purple-200/38">&bull;</span> {player.kills} {player.kills === 1 ? "kill" : "kills"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function podiumGridClass(count: number) {
  if (count === 1) {
    return "grid grid-cols-1 justify-items-center gap-5";
  }

  if (count === 2) {
    return "grid grid-cols-1 justify-items-center gap-5 md:grid-cols-[minmax(0,370px)_minmax(0,330px)] md:items-end md:justify-center";
  }

  return "grid grid-cols-1 justify-items-center gap-5 md:grid-cols-[minmax(0,330px)_minmax(0,370px)_minmax(0,330px)] md:items-end md:justify-center";
}
