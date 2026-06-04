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
    shell: "h-[320px] border-yellow-300/55 bg-[linear-gradient(180deg,rgba(250,204,21,0.14),rgba(16,8,28,0.84))] shadow-[0_0_54px_rgba(250,204,21,0.25)]",
    rankText: "text-yellow-100",
    accent: "from-yellow-200/28 via-yellow-400/8 to-transparent",
    order: "md:order-2 md:-translate-y-8",
    maxWidth: "max-w-[340px]",
    skinSize: "champion" as const
  },
  {
    rank: "#2",
    shell: "h-[260px] border-slate-200/42 bg-[linear-gradient(180deg,rgba(226,232,240,0.1),rgba(14,8,25,0.82))] shadow-[0_0_38px_rgba(226,232,240,0.17)]",
    rankText: "text-slate-100",
    accent: "from-slate-100/20 via-slate-400/6 to-transparent",
    order: "md:order-1",
    maxWidth: "max-w-[300px]",
    skinSize: "contender" as const
  },
  {
    rank: "#3",
    shell: "h-[260px] border-orange-300/42 bg-[linear-gradient(180deg,rgba(251,146,60,0.1),rgba(14,8,25,0.82))] shadow-[0_0_38px_rgba(251,146,60,0.17)]",
    rankText: "text-orange-100",
    accent: "from-orange-200/20 via-orange-500/6 to-transparent",
    order: "md:order-3",
    maxWidth: "max-w-[300px]",
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
            className={`neon-hover group relative flex w-full min-w-0 flex-col overflow-hidden rounded-lg border px-5 py-4 text-center backdrop-blur-md transition duration-200 hover:-translate-y-1 ${style.maxWidth} ${style.shell} ${style.order}`}
          >
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${style.accent}`} />
            <div className="relative flex justify-center">
              <span className={`grid h-11 min-w-14 place-items-center rounded-md border border-white/12 bg-black/34 px-3 text-2xl font-black leading-none ${style.rankText}`}>
                {style.rank}
              </span>
            </div>

            <div className="relative mt-3 flex flex-1 items-center justify-center">
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

            <div className="relative mt-3 min-w-0">
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <h3 className="w-full truncate text-xl font-black leading-tight text-white sm:text-2xl">{player.username}</h3>
                <PlatformBadge platform={player.platform} compact />
              </div>
              <p className="mt-3 truncate text-sm font-black text-purple-50/78">
                {player.points} Points <span className="mx-1 text-purple-200/38">•</span> {player.kills} {player.kills === 1 ? "Kill" : "Kills"}
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
    return "grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:items-end";
  }

  return "grid grid-cols-1 justify-items-center gap-5 md:grid-cols-[minmax(0,300px)_minmax(0,340px)_minmax(0,300px)] md:items-end md:justify-center";
}
