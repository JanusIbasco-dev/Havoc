import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PlayerHead } from "@/components/PlayerHead";
import { PlayerSkinRender } from "@/components/PlayerSkinRender";
import { StatBox } from "@/components/StatBox";
import { formatDate, formatHours } from "@/lib/format";
import { getPlayerProfile } from "@/lib/players";
import { getCurrentSeason } from "@/lib/season-data";
import { resolveSeasonNumber } from "@/lib/seasons";

type PlayerProfilePageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ season?: string }>;
};

export default async function PlayerProfilePage({ params, searchParams }: PlayerProfilePageProps) {
  const [{ username }, { season: seasonParam }] = await Promise.all([params, searchParams]);
  const currentSeason = await getCurrentSeason();
  const season = resolveSeasonNumber(seasonParam || currentSeason.season);
  const decodedUsername = decodeURIComponent(username);
  const profile = await getPlayerProfile(decodedUsername, season);

  if (!profile) {
    return <EmptyState />;
  }

  const { player, rank, kdRatio, recentActivity } = profile;

  return (
    <div className="relative min-h-screen overflow-hidden px-5 pb-12 pt-28">
      <div className="cinematic-overlay pointer-events-none fixed inset-0" />
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.035]" />
      <div className="ember-field pointer-events-none fixed inset-0 opacity-20" />

      <div className="relative mx-auto max-w-7xl space-y-8">
      <Link className="text-sm font-bold text-purple-200/70 transition hover:text-purple-100" href={`/players?season=${encodeURIComponent(season)}`}>
        Back to Players
      </Link>

      <section className="grid gap-6 lg:grid-cols-[390px_1fr]">
        <aside className="glass-panel purple-glow overflow-hidden rounded-3xl border-purple-300/20 p-5 shadow-[0_0_60px_rgba(139,92,246,0.18)]">
          <PlayerSkinRender uuid={player.uuid} username={player.username} skinUrl={player.skinUrl} />
          <div className="mt-5">
            <div className="flex items-center gap-4">
              <PlayerHead username={player.username} uuid={player.uuid} skinUrl={player.skinUrl} size="lg" />
              <div className="min-w-0">
                <h1 className="truncate text-4xl font-black text-white">{player.username}</h1>
                <p className="mt-2 text-purple-100/50">Rank {rank ? `#${rank}` : "N/A"}</p>
              </div>
            </div>
            <p className="mt-5 break-all border-t border-purple-500/14 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-purple-100/42">{player.uuid}</p>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="glass-panel rounded-3xl border-purple-300/18 p-6 shadow-[0_0_50px_rgba(139,92,246,0.12)]">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300">Player Profile</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ProfileFact label="Username" value={player.username} />
              <ProfileFact label="UUID" value={player.uuid} />
              <ProfileFact label="Current Rank" value={rank ? `#${rank}` : "N/A"} />
              <ProfileFact label="Season" value={`Season ${player.season}`} />
              <ProfileFact label="First Joined" value={formatDate(player.firstJoinTimestamp || player.firstJoin)} />
              <ProfileFact label="Last Seen" value={formatDate(player.lastSeen)} />
            </div>
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

      <section className="glass-panel rounded-3xl border-purple-300/18 p-6 shadow-[0_0_50px_rgba(139,92,246,0.12)]">
        <h2 className="text-2xl font-black text-white">Recent Activity</h2>
        <div className="mt-5 space-y-3">
          {recentActivity.map((event, index) => (
            <ActivityLine
              key={`${event.type}-${event.timestamp}-${index}`}
              text={event.text}
              meta={formatDate(event.timestamp)}
              danger={event.type === "death"}
            />
          ))}
          {recentActivity.length === 0 ? <p className="text-sm text-purple-100/55">No recent activity yet.</p> : null}
        </div>
      </section>
      </div>
    </div>
  );
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-purple-500/12 bg-black/24 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-100/38">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-purple-50">{value}</p>
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
