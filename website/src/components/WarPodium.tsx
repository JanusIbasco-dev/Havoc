import Link from "next/link";
import { PlayerHead } from "@/components/PlayerHead";
import { PlatformBadge } from "@/components/PlatformBadge";
import type { LeaderboardPlayer } from "@/types/player";

type WarPodiumProps = {
  players: LeaderboardPlayer[];
  compact?: boolean;
};

const podiumStyles = [
  {
    rank: "#1",
    row: "border-yellow-300/46 bg-yellow-300/[0.07] shadow-[inset_3px_0_0_rgba(250,204,21,0.8)]",
    rankText: "text-yellow-100",
    badge: "border-yellow-200/40 bg-yellow-300/14 shadow-[0_0_18px_rgba(250,204,21,0.16)]"
  },
  {
    rank: "#2",
    row: "border-slate-200/34 bg-slate-200/[0.055] shadow-[inset_3px_0_0_rgba(226,232,240,0.62)]",
    rankText: "text-slate-100",
    badge: "border-slate-100/32 bg-slate-100/10 shadow-[0_0_16px_rgba(226,232,240,0.12)]"
  },
  {
    rank: "#3",
    row: "border-orange-300/34 bg-orange-300/[0.055] shadow-[inset_3px_0_0_rgba(251,146,60,0.62)]",
    rankText: "text-orange-100",
    badge: "border-orange-200/32 bg-orange-300/10 shadow-[0_0_16px_rgba(251,146,60,0.12)]"
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
      <div className="glass-panel relative overflow-hidden rounded-xl border-purple-300/18 p-3 shadow-[0_0_42px_rgba(139,92,246,0.12)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-purple-500/10 to-transparent" />
        <div className="relative grid gap-3 lg:grid-cols-3">
        {entries.map(({ player, style }) => (
          <Link
            key={`${player.uuid}-${player.season}`}
            href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
            className={`group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border px-3.5 py-3.5 text-left transition duration-200 hover:border-purple-300/45 hover:bg-purple-500/[0.08] hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] ${style.row}`}
          >
            <span className={`grid h-11 min-w-14 shrink-0 place-items-center rounded-md border px-3 text-xl font-black leading-none ${style.rankText} ${style.badge}`}>
                {style.rank}
            </span>

            <div className="shrink-0">
              <PlayerHead
                uuid={player.uuid}
                username={player.username}
                skinUrl={player.skinUrl}
                skinProvider={player.skinProvider}
                platform={player.platform}
                size="md"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="min-w-0 truncate text-base font-black leading-tight text-white sm:text-lg" title={player.username}>
                  {player.username}
                </h3>
                <PlatformBadge platform={player.platform} compact />
              </div>
              <p className="mt-1 truncate text-sm font-bold text-purple-50/72">
                {player.points} pts <span className="mx-1 text-purple-200/35">&bull;</span> {player.kills} {player.kills === 1 ? "kill" : "kills"} <span className="mx-1 text-purple-200/35">&bull;</span> {player.deaths} {player.deaths === 1 ? "death" : "deaths"}
              </p>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </section>
  );
}
