import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PlayerBodyPreview } from "@/components/PlayerBodyPreview";
import { PlatformBadge } from "@/components/PlatformBadge";
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
    <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-24 sm:px-5 sm:pt-28">
      <div className="cinematic-overlay pointer-events-none fixed inset-0" />
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.035]" />
      <div className="ember-field pointer-events-none fixed inset-0 opacity-20" />

      <div className="relative mx-auto w-full max-w-7xl space-y-8">
      <Link className="inline-flex min-h-11 items-center text-sm font-bold text-purple-200/70 transition hover:text-purple-100" href={`/players?season=${encodeURIComponent(season)}`}>
        Back to Players
      </Link>

      <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,390px)_minmax(0,1fr)]">
        <aside className="glass-panel purple-glow min-w-0 overflow-hidden rounded-xl border-purple-300/20 px-4 py-5 shadow-[0_0_60px_rgba(139,92,246,0.18)] sm:rounded-3xl sm:px-6 sm:py-7">
          <div className="profile-preview-showcase">
            <span className="profile-particle left-[18%] top-[22%] animation-delay-0" />
            <span className="profile-particle right-[16%] top-[18%] animation-delay-300" />
            <span className="profile-particle bottom-[24%] left-[24%] animation-delay-700" />
            <span className="profile-particle bottom-[18%] right-[22%] animation-delay-1000" />
            <div className="relative z-10 grid place-items-center">
              <PlayerBodyPreview player={player} size={260} className="profile-body-preview" />
            </div>
          </div>
          <div className="mt-7 text-center">
            <h1 className="break-words text-[clamp(2rem,13vw,3.25rem)] font-black leading-none text-white">{player.username}</h1>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <PlatformBadge platform={player.platform} />
              <span className="rounded-md border border-purple-300/15 bg-purple-500/10 px-3 py-1.5 text-sm font-black uppercase tracking-[0.12em] text-purple-100/70">
                Rank {rank ? `#${rank}` : "N/A"}
              </span>
            </div>
            <p className="mt-6 break-all border-t border-purple-500/14 px-1 pt-5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-purple-100/38 sm:px-2 sm:text-xs sm:tracking-[0.14em]">{player.uuid}</p>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="glass-panel rounded-xl border-purple-300/18 p-4 shadow-[0_0_50px_rgba(139,92,246,0.12)] sm:rounded-3xl sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-300 sm:tracking-[0.22em]">Player Profile</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ProfileFact label="Username" value={player.username} />
              <ProfileFact label="UUID" value={player.uuid} />
              <ProfileFact label="Platform" value={player.platform === "bedrock" ? "Bedrock" : "Java"} />
              {player.xuid ? <ProfileFact label="XUID" value={player.xuid} /> : null}
              {player.floodgateUuid ? <ProfileFact label="Floodgate UUID" value={player.floodgateUuid} /> : null}
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

      <section className="glass-panel rounded-xl border-purple-300/18 p-4 shadow-[0_0_50px_rgba(139,92,246,0.12)] sm:rounded-3xl sm:p-6">
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
    <div className="min-w-0 border border-purple-500/12 bg-black/24 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-purple-100/38 sm:tracking-[0.18em]">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-purple-50">{value}</p>
    </div>
  );
}

function ActivityLine({ text, meta, danger }: { text: string; meta: string; danger?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-purple-500/12 bg-black/24 p-4 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl">
      <span className={`min-w-0 break-words font-bold ${danger ? "text-rose-300" : "text-purple-100"}`}>{text}</span>
      <span className="shrink-0 text-sm text-purple-100/45">{meta}</span>
    </div>
  );
}
