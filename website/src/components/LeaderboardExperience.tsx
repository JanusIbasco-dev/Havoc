"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlayerHead } from "@/components/PlayerHead";
import { formatHours } from "@/lib/format";
import { getRankMap, sortPlayers } from "@/lib/rankings";
import type { LeaderboardPlayer } from "@/types/player";

type LeaderboardExperienceProps = {
  players: LeaderboardPlayer[];
};

const pageSize = 10;

export function LeaderboardExperience({ players }: LeaderboardExperienceProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sorted = sortPlayers(players);
    if (!normalizedQuery) {
      return sorted;
    }
    return sorted.filter((player) => player.username.toLowerCase().includes(normalizedQuery));
  }, [players, query]);

  const rankMap = useMemo(() => getRankMap(players), [players]);
  const pageCount = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));
  const visiblePlayers = filteredPlayers.slice((page - 1) * pageSize, page * pageSize);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <section id="leaderboard" className="glass-panel rounded-3xl p-4 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-purple-500/15 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Official Leaderboard</h2>
          <p className="mt-1 text-sm text-purple-100/50">Kills matter. Survival matters. Points decide the champion.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search player"
            className="rounded-full border border-purple-400/25 bg-black/35 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-purple-100/35 focus:border-purple-300/70 focus:shadow-[0_0_24px_rgba(139,92,246,0.22)]"
          />
          <button className="rounded-full border border-purple-400/25 bg-purple-500/15 px-4 py-2.5 text-sm font-bold text-purple-100" type="button">
            Sort: Points
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-purple-100/45">
            <tr>
              <th className="px-3 py-3">Rank</th>
              <th className="px-3 py-3">Player</th>
              <th className="px-3 py-3 text-right">Kills</th>
              <th className="px-3 py-3 text-right">Deaths</th>
              <th className="px-3 py-3 text-right">Points</th>
              <th className="px-3 py-3 text-right">Hours</th>
            </tr>
          </thead>
          <tbody>
            {visiblePlayers.map((player) => {
              const rank = rankMap.get(player.uuid) || 0;
              return (
                <tr key={`${player.uuid}-${player.season}`} className="border-t border-purple-500/12 transition hover:bg-purple-500/[0.06]">
                  <td className="px-3 py-4 text-lg font-black text-purple-200">#{rank}</td>
                  <td className="px-3 py-4">
                    <Link className="flex items-center gap-3 font-bold text-white hover:text-purple-200" href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}>
                      <PlayerHead username={player.username} uuid={player.uuid} skinUrl={player.skinUrl} skinProvider={player.skinProvider} size="sm" />
                      <span>{player.username}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-right">{player.kills}</td>
                  <td className="px-3 py-4 text-right text-rose-300">{player.deaths}</td>
                  <td className="px-3 py-4 text-right text-lg font-black text-[var(--accent-strong)]">{player.points}</td>
                  <td className="px-3 py-4 text-right">{formatHours(player.hoursOfGameplay)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visiblePlayers.length === 0 ? <p className="py-10 text-center text-purple-100/55">No players match your search.</p> : null}

      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-purple-100/60">
        <span>
          Page {page} of {pageCount}
        </span>
        <div className="flex gap-2">
          <button className="neon-hover rounded-full border border-purple-400/25 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-35" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">
            Previous
          </button>
          <button className="neon-hover rounded-full border border-purple-400/25 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-35" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} type="button">
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
