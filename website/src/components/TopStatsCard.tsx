import { formatHours } from "@/lib/format";
import { topBy } from "@/lib/rankings";
import type { LeaderboardPlayer } from "@/types/player";

type TopStatsCardProps = {
  players: LeaderboardPlayer[];
};

export function TopStatsCard({ players }: TopStatsCardProps) {
  const stats = [
    { label: "Most Kills", player: topBy(players, "kills"), value: (player: LeaderboardPlayer) => player.kills },
    { label: "Most Deaths", player: topBy(players, "deaths"), value: (player: LeaderboardPlayer) => player.deaths },
    { label: "Highest Points", player: topBy(players, "points"), value: (player: LeaderboardPlayer) => player.points },
    { label: "Most Playtime", player: topBy(players, "hoursOfGameplay"), value: (player: LeaderboardPlayer) => formatHours(player.hoursOfGameplay) }
  ];

  return (
    <section className="glass-panel rounded-lg p-5">
      <p className="text-xs uppercase tracking-wide text-purple-200/55">Top Stats</p>
      <div className="mt-4 space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-purple-500/20 bg-black/24 p-3">
            <div className="text-xs text-purple-100/45">{stat.label}</div>
            {stat.player ? (
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="truncate font-bold">{stat.player.username}</span>
                <span className="font-black text-[var(--accent-strong)]">{stat.value(stat.player)}</span>
              </div>
            ) : (
              <div className="mt-1 text-sm text-purple-100/55">No data</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
