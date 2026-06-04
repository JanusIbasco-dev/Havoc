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
    medal: "1",
    skinSize: "champion" as const,
    card: "border-yellow-300/45 bg-[linear-gradient(135deg,rgba(250,204,21,0.18),rgba(26,18,8,0.74)_42%,rgba(16,10,28,0.9))] shadow-[0_0_30px_rgba(250,204,21,0.2),inset_0_1px_0_rgba(255,255,255,0.12)]",
    accent: "from-yellow-200 via-yellow-400 to-yellow-700",
    rankText: "text-yellow-100"
  },
  {
    rank: "#2",
    medal: "2",
    skinSize: "contender" as const,
    card: "border-slate-200/34 bg-[linear-gradient(135deg,rgba(226,232,240,0.12),rgba(24,24,32,0.76)_42%,rgba(16,10,28,0.9))] shadow-[0_0_24px_rgba(226,232,240,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]",
    accent: "from-white via-slate-300 to-slate-600",
    rankText: "text-slate-100"
  },
  {
    rank: "#3",
    medal: "3",
    skinSize: "contender" as const,
    card: "border-orange-300/34 bg-[linear-gradient(135deg,rgba(251,146,60,0.12),rgba(30,20,16,0.76)_42%,rgba(16,10,28,0.9))] shadow-[0_0_24px_rgba(251,146,60,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]",
    accent: "from-orange-100 via-orange-400 to-orange-800",
    rankText: "text-orange-100"
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
      <div className="pointer-events-none absolute inset-x-0 top-12 h-52 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18),transparent_66%)]" />
      <div className="relative grid gap-3">
        {entries.map(({ player, style }) => (
          <Link
            key={`${player.uuid}-${player.season}`}
            href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
            className={`group relative min-h-[132px] overflow-hidden rounded-xl border px-4 py-3 transition duration-200 [clip-path:polygon(0_0,100%_0,96%_100%,0_100%)] hover:-translate-y-0.5 hover:border-purple-300/45 hover:shadow-[0_0_34px_rgba(139,92,246,0.2)] ${style.card}`}
          >
            <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${style.accent}`} />
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-purple-500/14 blur-2xl transition group-hover:bg-purple-400/20" />
            <div className="absolute bottom-0 right-8 h-10 w-32 rounded-full bg-black/38 blur-md" />

            <div className="relative grid grid-cols-[minmax(0,1fr)_120px] items-center gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`grid h-9 min-w-12 place-items-center rounded-md border border-white/14 bg-black/30 px-2 text-lg font-black ${style.rankText}`}>
                    {style.rank}
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-purple-100/45">Top Player</span>
                </div>
                <h3 className="mt-3 max-w-full truncate text-xl font-black leading-tight text-white" title={player.username}>
                  {player.username}
                </h3>
                <p className="mt-1 text-sm font-black text-purple-50/78">{player.points} Points</p>
              </div>

              <div className="relative flex h-[110px] items-end justify-center overflow-visible">
                <div className="absolute bottom-0 h-7 w-24 rounded-full bg-purple-950/54 blur-md" />
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
          </Link>
        ))}
      </div>
    </section>
  );
}
