import { PlayerBodyPreview } from "@/components/PlayerBodyPreview";
import { PlatformBadge } from "@/components/PlatformBadge";
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
            <tr key={`${player.uuid}-${player.season}`} className="h-[82px] border-t border-purple-500/20 transition hover:bg-purple-500/8">
              <td className="px-3 py-0 align-middle font-black text-[var(--accent-strong)]">#{index + 1}</td>
              <td className="px-3 py-0 align-middle">
                <Link className="flex h-[82px] items-center gap-[18px] hover:text-purple-200" href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}>
                  <div className={`ranking-preview-frame ${rankingPreviewClass(index)}`}>
                    <PlayerBodyPreview player={player} size={118} className="ranking-body-preview" />
                  </div>
                  <div>
                    <div className="font-bold">{player.username}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <PlatformBadge platform={player.platform} compact />
                      <span className="max-w-[190px] truncate text-xs text-purple-100/45 sm:max-w-[300px]">{player.uuid}</span>
                    </div>
                  </div>
                </Link>
              </td>
              <td className="px-3 py-0 text-right align-middle">{player.kills}</td>
              <td className="px-3 py-0 text-right align-middle text-rose-300">{player.deaths}</td>
              <td className="px-3 py-0 text-right align-middle font-black text-purple-100">{player.points}</td>
              <td className="px-3 py-0 text-right align-middle">{formatHours(player.hoursOfGameplay)}</td>
              <td className="px-3 py-0 text-right align-middle">
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

function rankingPreviewClass(index: number) {
  return index === 0 ? "ranking-preview-gold" : index === 1 ? "ranking-preview-silver" : index === 2 ? "ranking-preview-bronze" : "";
}
