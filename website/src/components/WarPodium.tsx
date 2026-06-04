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
    label: "Champion",
    shell: "border-yellow-300/55 bg-yellow-300/[0.08] shadow-[0_0_54px_rgba(245,196,81,0.25)]",
    rankText: "text-yellow-100",
    accent: "from-yellow-200/24 via-purple-400/14 to-transparent",
    order: "md:order-2 md:-translate-y-6"
  },
  {
    rank: "#2",
    label: "Runner Up",
    shell: "border-slate-200/35 bg-slate-200/[0.06] shadow-[0_0_38px_rgba(216,221,231,0.12)]",
    rankText: "text-slate-100",
    accent: "from-slate-100/18 via-purple-400/12 to-transparent",
    order: "md:order-1"
  },
  {
    rank: "#3",
    label: "Third Place",
    shell: "border-orange-300/35 bg-orange-300/[0.06] shadow-[0_0_38px_rgba(196,122,69,0.13)]",
    rankText: "text-orange-100",
    accent: "from-orange-200/18 via-purple-400/12 to-transparent",
    order: "md:order-3"
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
            className={`neon-hover group relative flex min-h-[340px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border p-5 text-center backdrop-blur-md transition duration-200 hover:-translate-y-1 ${style.shell} ${style.order}`}
          >
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${style.accent}`} />
            <div className="relative flex items-center justify-between gap-3">
              <span className={`text-3xl font-black leading-none ${style.rankText}`}>{style.rank}</span>
              <span className="border border-purple-300/16 bg-black/24 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-purple-100/58">
                {style.label}
              </span>
            </div>

            <div className="relative mt-4 flex flex-1 items-center justify-center">
              <PlayerSkinRender uuid={player.uuid} username={player.username} skinUrl={player.skinUrl} skinProvider={player.skinProvider} platform={player.platform} podium />
            </div>

            <div className="relative mt-4 min-w-0">
              <div className="flex flex-col items-center gap-2">
                <h3 className="max-w-full truncate text-2xl font-black leading-tight text-white">{player.username}</h3>
                <PlatformBadge platform={player.platform} compact />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <PodiumStat label="Points" value={player.points} primary />
                <PodiumStat label="Kills" value={player.kills} />
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
    return "grid grid-cols-1 justify-items-center gap-5 [&>*]:max-w-[420px]";
  }

  if (count === 2) {
    return "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-end";
  }

  return "grid grid-cols-1 gap-5 md:grid-cols-3 md:items-end";
}

function PodiumStat({ label, value, primary }: { label: string; value: number; primary?: boolean }) {
  return (
    <div className="border border-purple-300/12 bg-black/28 p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-purple-100/42">{label}</p>
      <p className={`mt-1 text-xl font-black ${primary ? "text-purple-100" : "text-purple-50/82"}`}>{value}</p>
    </div>
  );
}
