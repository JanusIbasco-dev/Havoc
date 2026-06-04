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
    block: "h-[132px] border-yellow-300/55 bg-[linear-gradient(180deg,rgba(250,204,21,0.16),rgba(34,20,8,0.78)_45%,rgba(10,6,18,0.94))] shadow-[0_0_46px_rgba(250,204,21,0.22),inset_0_1px_0_rgba(255,255,255,0.14)]",
    cap: "bg-yellow-200/80 shadow-[0_0_24px_rgba(250,204,21,0.28)]",
    rankText: "text-yellow-100",
    order: "md:order-2 md:-translate-y-10",
    width: "max-w-[360px]",
    skinSize: "champion" as const,
    skinLift: ""
  },
  {
    rank: "#2",
    block: "h-[108px] border-slate-200/45 bg-[linear-gradient(180deg,rgba(226,232,240,0.12),rgba(25,26,34,0.82)_48%,rgba(10,6,18,0.94))] shadow-[0_0_34px_rgba(226,232,240,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]",
    cap: "bg-slate-100/70 shadow-[0_0_20px_rgba(226,232,240,0.2)]",
    rankText: "text-slate-100",
    order: "md:order-1",
    width: "max-w-[315px]",
    skinSize: "contender" as const,
    skinLift: "md:-translate-y-3"
  },
  {
    rank: "#3",
    block: "h-[92px] border-orange-300/45 bg-[linear-gradient(180deg,rgba(251,146,60,0.12),rgba(35,20,12,0.82)_48%,rgba(10,6,18,0.94))] shadow-[0_0_34px_rgba(251,146,60,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]",
    cap: "bg-orange-300/70 shadow-[0_0_20px_rgba(251,146,60,0.2)]",
    rankText: "text-orange-100",
    order: "md:order-3",
    width: "max-w-[315px]",
    skinSize: "contender" as const,
    skinLift: ""
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
            className={`group flex w-full min-w-0 flex-col items-center text-center transition duration-200 hover:-translate-y-1 ${style.width} ${style.order}`}
          >
            <div className={`relative z-10 flex justify-center overflow-visible ${style.skinLift}`}>
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

            <div className={`relative w-full min-w-0 overflow-hidden rounded-lg border px-5 pb-4 pt-3 backdrop-blur-sm ${style.block}`}>
              <div className={`absolute inset-x-0 top-0 h-1 ${style.cap}`} />
              <div className="absolute inset-x-8 -top-4 h-10 rounded-full bg-purple-500/16 blur-xl" />
              <div className="relative flex justify-center">
                <span className={`text-3xl font-black leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${style.rankText}`}>{style.rank}</span>
              </div>
              <div className="relative mt-2 min-w-0">
                <h3 className="mx-auto w-full max-w-full truncate text-xl font-black leading-tight text-white sm:text-2xl" title={player.username}>
                  {player.username}
                </h3>
                <div className="mt-1.5 flex justify-center">
                  <PlatformBadge platform={player.platform} compact />
                </div>
                <p className="mt-2 truncate text-sm font-black text-purple-50/78">
                  {player.points} pts <span className="mx-1 text-purple-200/38">&bull;</span> {player.kills}k
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function podiumGridClass(count: number) {
  if (count === 1) {
    return "grid grid-cols-1 justify-items-center gap-8 pt-2 md:pt-12";
  }

  if (count === 2) {
    return "grid grid-cols-1 justify-items-center gap-8 pt-2 md:grid-cols-[minmax(0,360px)_minmax(0,315px)] md:items-end md:justify-center md:gap-10 md:pt-12";
  }

  return "grid grid-cols-1 justify-items-center gap-8 pt-2 md:grid-cols-[minmax(0,315px)_minmax(0,360px)_minmax(0,315px)] md:items-end md:justify-center md:gap-10 md:pt-16";
}
