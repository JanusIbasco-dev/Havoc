import Link from "next/link";
import { PlayerHead } from "@/components/PlayerHead";
import { formatHours } from "@/lib/format";
import type { LeaderboardPlayer } from "@/types/player";

type SeasonChampionCardProps = {
  player: LeaderboardPlayer | null;
};

export function SeasonChampionCard({ player }: SeasonChampionCardProps) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <p className="text-xs uppercase tracking-wide text-purple-200/55">Season Champion</p>
      {player ? (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <PlayerHead username={player.username} uuid={player.uuid} skinUrl={player.skinUrl} skinProvider={player.skinProvider} />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black">{player.username}</h2>
              <p className="text-xs text-purple-100/45">{player.season}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-black/28 p-3">
              <div className="text-purple-100/45">Points</div>
              <div className="font-black text-[var(--accent-strong)]">{player.points}</div>
            </div>
            <div className="rounded-md bg-black/28 p-3">
              <div className="text-purple-100/45">Hours</div>
              <div className="font-black">{formatHours(player.hoursOfGameplay)}</div>
            </div>
          </div>
          <Link className="neon-hover inline-flex rounded-md border border-purple-400/35 bg-purple-950/35 px-3 py-2 text-sm font-bold" href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}>
            View Profile
          </Link>
        </div>
      ) : (
        <p className="mt-4 text-sm text-purple-100/60">No champion yet.</p>
      )}
    </section>
  );
}
