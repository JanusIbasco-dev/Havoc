import { PlayerHead } from "@/components/PlayerHead";
import { formatHours } from "@/lib/format";
import type { LeaderboardPlayer } from "@/types/player";
import Link from "next/link";

type LeaderboardTableProps = {
  players: LeaderboardPlayer[];
};

export function LeaderboardTable({ players }: LeaderboardTableProps) {
  return (
    <div className="glass-panel overflow-x-auto rounded-lg">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-purple-500/10 text-xs uppercase tracking-wide text-purple-100/60">
          <tr>
            <th className="px-3 py-3">Rank</th>
            <th className="px-3 py-3">Player</th>
            <th className="px-3 py-3 text-right">Kills</th>
            <th className="px-3 py-3 text-right">Deaths</th>
            <th className="px-3 py-3 text-right">Points</th>
            <th className="px-3 py-3 text-right">Hours</th>
            <th className="px-3 py-3 text-right">Profile</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={`${player.uuid}-${player.season}`} className="border-t border-purple-500/20 transition hover:bg-purple-500/8">
              <td className="px-3 py-4 font-black text-[var(--accent-strong)]">#{index + 1}</td>
              <td className="px-3 py-3">
                <Link className="flex items-center gap-3 hover:text-purple-200" href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}>
                  <PlayerHead username={player.username} uuid={player.uuid} skinUrl={player.skinUrl} />
                  <div>
                    <div className="font-bold">{player.username}</div>
                    <div className="max-w-[190px] truncate text-xs text-purple-100/45 sm:max-w-[300px]">{player.uuid}</div>
                  </div>
                </Link>
              </td>
              <td className="px-3 py-3 text-right">{player.kills}</td>
              <td className="px-3 py-3 text-right text-rose-300">{player.deaths}</td>
              <td className="px-3 py-3 text-right font-black text-purple-100">{player.points}</td>
              <td className="px-3 py-3 text-right">{formatHours(player.hoursOfGameplay)}</td>
              <td className="px-3 py-3 text-right">
                <Link
                  className="neon-hover inline-flex rounded-md border border-purple-400/35 bg-purple-950/35 px-3 py-2 text-xs font-bold text-purple-100"
                  href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
                >
                  View Profile
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
