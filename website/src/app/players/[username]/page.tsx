import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PlayerSkinRender } from "@/components/PlayerSkinRender";
import { StatBox } from "@/components/StatBox";
import { formatDate, formatHours } from "@/lib/format";
import { getPlayerByUuidOrUsername, getPlayerHistory, getPlayers } from "@/lib/players";
import { getPlayerRank } from "@/lib/rankings";
import { resolveSeason } from "@/lib/seasons";

type PlayerProfilePageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ season?: string }>;
};

export default async function PlayerProfilePage({ params, searchParams }: PlayerProfilePageProps) {
  const [{ username }, { season: seasonParam }] = await Promise.all([params, searchParams]);
  const season = resolveSeason(seasonParam);
  const decodedUsername = decodeURIComponent(username);
  const player = await getPlayerByUuidOrUsername(decodedUsername, season);

  if (!player) {
    return <EmptyState />;
  }

  const [players, history] = await Promise.all([getPlayers(season), getPlayerHistory(player.uuid, season)]);
  const rank = getPlayerRank(players, player.uuid);
  const kdRatio = player.deaths === 0 ? player.kills.toFixed(2) : (player.kills / player.deaths).toFixed(2);

  return (
    <div className="space-y-8">
      <Link className="text-sm font-bold text-purple-200/70 transition hover:text-purple-100" href={`/players?season=${encodeURIComponent(season)}`}>
        Back to Players
      </Link>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="glass-panel purple-glow rounded-3xl p-5">
          <PlayerSkinRender uuid={player.uuid} username={player.username} />
          <div className="mt-5">
            <h1 className="truncate text-4xl font-black text-white">{player.username}</h1>
            <p className="mt-2 text-purple-100/50">Rank {rank ? `#${rank}` : "N/A"}</p>
            <p className="text-purple-100/40">{player.season}</p>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="glass-panel rounded-3xl p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300">Player Profile</p>
            <p className="mt-3 break-all text-sm text-purple-100/50">{player.uuid}</p>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatBox label="Points" value={player.points} />
            <StatBox label="Kills" value={player.kills} />
            <StatBox label="Deaths" value={player.deaths} />
            <StatBox label="KD Ratio" value={kdRatio} />
            <StatBox label="Playtime" value={formatHours(player.hoursOfGameplay)} />
          </section>
        </div>
      </section>

      <section className="glass-panel rounded-3xl p-5">
        <h2 className="text-2xl font-black text-white">Recent Activity</h2>
        <div className="mt-5 space-y-3">
          {player.firstJoinTimestamp ? <ActivityLine text="Joined server" meta={formatDate(player.firstJoinTimestamp)} /> : null}
          {history.map((event, index) => (
            <ActivityLine
              key={`${event.type}-${event.timestamp}-${index}`}
              text={event.type === "kill" ? `Killed ${event.opponentUsername || "a player"}` : `Died to ${event.opponentUsername || "a player"}`}
              meta={formatDate(event.timestamp)}
              danger={event.type === "death"}
            />
          ))}
          {!player.firstJoinTimestamp && history.length === 0 ? <p className="text-sm text-purple-100/55">No recent activity available.</p> : null}
        </div>
      </section>
    </div>
  );
}

function ActivityLine({ text, meta, danger }: { text: string; meta: string; danger?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-purple-500/12 bg-black/24 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className={`font-bold ${danger ? "text-rose-300" : "text-purple-100"}`}>{text}</span>
      <span className="text-sm text-purple-100/45">{meta}</span>
    </div>
  );
}
