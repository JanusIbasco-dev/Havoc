import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PlayerBodyPreview } from "@/components/PlayerBodyPreview";
import { PlatformBadge } from "@/components/PlatformBadge";
import { formatHours } from "@/lib/format";
import { getPlayers } from "@/lib/players";
import { getRankMap } from "@/lib/rankings";
import { resolveSeason } from "@/lib/seasons";

type PlayersPageProps = {
  searchParams: Promise<{ season?: string }>;
};

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const { season: seasonParam } = await searchParams;
  const season = resolveSeason(seasonParam);
  const players = await getPlayers(season);
  const ranks = getRankMap(players);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-purple-300">{season}</p>
        <h1 className="mt-3 text-5xl font-black text-white">Players</h1>
      </section>

      {players.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <Link
              key={`${player.uuid}-${player.season}`}
              href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
              className="glass-panel neon-hover rounded-3xl p-5"
            >
              <div className="flex items-center gap-4">
                <div className="ranking-preview-frame">
                  <PlayerBodyPreview player={player} size={118} className="ranking-body-preview" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black text-white">{player.username}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <PlatformBadge platform={player.platform} compact />
                    <p className="text-sm text-purple-100/45">Rank #{ranks.get(player.uuid) || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Stat label="Points" value={player.points} highlight />
                <Stat label="Kills" value={player.kills} />
                <Stat label="Deaths" value={player.deaths} danger />
                <Stat label="Playtime" value={formatHours(player.hoursOfGameplay)} />
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function Stat({ label, value, highlight, danger }: { label: string; value: string | number; highlight?: boolean; danger?: boolean }) {
  return (
    <div className="rounded-2xl border border-purple-500/12 bg-black/24 p-3">
      <div className="text-xs text-purple-100/40">{label}</div>
      <div className={`mt-1 text-lg font-black ${highlight ? "text-purple-200" : danger ? "text-rose-300" : "text-white"}`}>{value}</div>
    </div>
  );
}
