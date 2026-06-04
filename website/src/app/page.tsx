import Link from "next/link";
import type { ReactNode } from "react";
import { MotionReveal } from "@/components/MotionReveal";
import { PlayerHeadAvatar } from "@/components/PlayerHeadAvatar";
import { WarPodium } from "@/components/WarPodium";
import { formatHours, formatPhilippineDate } from "@/lib/format";
import { getPlayers } from "@/lib/players";
import { getCurrentSeason, getDaysRemaining, getSeasonStatusLabel } from "@/lib/season-data";
import { resolveSeason } from "@/lib/seasons";

type HomePageProps = {
  searchParams: Promise<{ season?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { season: seasonParam } = await searchParams;
  const currentSeason = await getCurrentSeason();
  const season = resolveSeason(seasonParam || currentSeason.name);
  const players = await getPlayers(season);
  const champion = players[0] || null;
  const seasonLabel = getSeasonStatusLabel(currentSeason);
  const daysRemaining = getDaysRemaining(currentSeason);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="cinematic-overlay pointer-events-none fixed inset-0" />
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.035]" />
      <div className="ember-field pointer-events-none fixed inset-0 opacity-24" />
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#08080a] via-[#08080a]/70 to-transparent" />

      <main className="relative mx-auto max-w-7xl px-5 pb-10 pt-24">
        <MotionReveal>
          <section id="seasons" className="grid min-h-[360px] items-center gap-8 py-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-2xl">
              <p className="blocky-title text-base uppercase tracking-[0.32em] text-purple-300">{currentSeason.name}</p>
              <h1 className="blocky-title mt-4 text-4xl leading-[0.98] text-white drop-shadow-[0_0_26px_rgba(0,0,0,0.9)] sm:text-5xl lg:text-6xl">
                50 PLAYERS.
                <br />
                SHRINKING WORLD.
                <br />
                ONE CHAMPION.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-purple-50/70">
                Track kills, deaths, points, teams, and playtime in the official Havoc SMP leaderboard.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link className="neon-hover border border-purple-300/40 bg-purple-600/80 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_0_30px_rgba(139,92,246,0.34)]" href="#leaderboard">
                  View Leaderboard
                </Link>
                <Link className="neon-hover border border-purple-300/28 bg-black/42 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-purple-50 backdrop-blur" href="/players">
                  View Players
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <HeroBadge label="50 Slots" />
                <HeroBadge label="Teams Enabled" />
                <HeroBadge label={currentSeason.name} />
                <HeroBadge label="Champion Crown Available" />
              </div>
            </div>
            <div className="hidden min-h-[320px] lg:block" aria-hidden="true" />
          </section>
        </MotionReveal>

        <MotionReveal>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard icon="users" label="Players" value={`${players.length} / 50`} />
            <SeasonStatusCard season={currentSeason} label={seasonLabel} daysRemaining={daysRemaining} />
            <StatusCard icon="globe" label="World Border" value={`${currentSeason.worldBorderSize.toLocaleString()} blocks`} detail={currentSeason.worldBorderStatus} />
            <StatusCard icon="crown" label="Champion" value={champion?.username || "Unclaimed"} danger />
          </section>
        </MotionReveal>

        <section id="leaderboard" className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] lg:items-start">
          <MotionReveal className="contents lg:col-start-1 lg:row-start-1 lg:block lg:space-y-5">
            <div className="order-1">
              <SectionHeader eyebrow={season} title={`${currentSeason.name} Leaderboard`} />
            </div>
            <div className="order-3">
              <CompactLeaderboard players={players} />
            </div>
          </MotionReveal>

          <aside className="contents lg:col-start-2 lg:row-start-1 lg:block lg:space-y-8">
            <MotionReveal className="order-2" delay={0.06}>
              <div className="space-y-5">
                <SectionHeader eyebrow="Podium" title="Top 3 Players" />
                <WarPodium players={players} compact />
              </div>
            </MotionReveal>

            <MotionReveal className="order-4" delay={0.12}>
              <div id="rules" className="space-y-5">
                <SectionHeader eyebrow="Victory Path" title="How to Become Champion" />
                <ChampionStrip />
              </div>
            </MotionReveal>
          </aside>
        </section>

        <MotionReveal>
          <section className="mt-8 overflow-hidden border border-purple-500/24 bg-black/54 p-5 shadow-[0_0_36px_rgba(139,92,246,0.14)] backdrop-blur-md sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="blocky-title text-2xl text-white">JOIN THE WAR ROOM</p>
              <p className="mt-1 text-sm text-purple-100/58">Squads, announcements, season updates, and killfeed drops live in Discord.</p>
            </div>
            <Link className="neon-hover mt-4 inline-flex border border-red-300/30 bg-red-950/40 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-red-100 sm:mt-0" href="#">
              Join Discord
            </Link>
          </section>
        </MotionReveal>
      </main>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.26em] text-red-300/72">{eyebrow}</p>
      <h2 className="blocky-title mt-1 text-2xl text-white">{title}</h2>
    </div>
  );
}

function HeroBadge({ label }: { label: string }) {
  return (
    <span className="border border-purple-400/22 bg-black/38 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-purple-100/72 shadow-[0_0_20px_rgba(139,92,246,0.14)] backdrop-blur">
      {label}
    </span>
  );
}

function StatusCard({ icon, label, value, detail, danger }: { icon: "users" | "calendar" | "globe" | "crown"; label: string; value: string; detail?: string; danger?: boolean }) {
  return (
    <article className="glass-panel neon-hover p-5 hover:shadow-[0_0_46px_rgba(139,92,246,0.34)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-100/42">{label}</p>
          <p className={`mt-3 text-2xl font-black ${danger ? "text-red-100" : "text-purple-100"}`}>{value}</p>
          {detail ? <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-purple-100/44">{detail}</p> : null}
        </div>
        <StatusIcon name={icon} danger={danger} />
      </div>
    </article>
  );
}

function SeasonStatusCard({
  season,
  label,
  daysRemaining
}: {
  season: Awaited<ReturnType<typeof getCurrentSeason>>;
  label: string;
  daysRemaining: number | null;
}) {
  const active = season.status === "active";

  return (
    <article className="glass-panel neon-hover p-5 shadow-[0_0_34px_rgba(139,92,246,0.12)] hover:shadow-[0_0_46px_rgba(139,92,246,0.34)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-100/42">Season</p>
          <p className={`mt-3 text-2xl font-black ${active ? "text-purple-100" : "text-red-100"}`}>{label}</p>
          <div className="mt-3 space-y-1 text-xs font-bold uppercase tracking-[0.12em] text-purple-100/48">
            <p>{daysRemaining === null ? "Days remaining TBD" : `${daysRemaining} days remaining`}</p>
            <p>Starts {formatSeasonDate(season.startsAt)}</p>
            <p>Ends {formatSeasonDate(season.endsAt)}</p>
          </div>
        </div>
        <StatusIcon name="calendar" danger={!active} />
      </div>
    </article>
  );
}

function formatSeasonDate(value?: string) {
  if (!value) {
    return "TBD";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return formatPhilippineDate(date);
}

function StatusIcon({ name, danger }: { name: "users" | "calendar" | "globe" | "crown"; danger?: boolean }) {
  const stroke = danger ? "text-red-200" : "text-purple-200";
  const paths = {
    users: (
      <>
        <path d="M15 19c0-2.2-2.7-4-6-4s-6 1.8-6 4" />
        <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M21 19c0-1.8-1.7-3.3-4.1-3.8" />
        <path d="M15.5 5.2a3 3 0 0 1 0 5.6" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 9h16" />
        <path d="M5 5h14v16H5z" />
      </>
    ),
    globe: (
      <>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path d="M3.6 9h16.8" />
        <path d="M3.6 15h16.8" />
        <path d="M12 3c2 2.2 3 5.2 3 9s-1 6.8-3 9" />
        <path d="M12 3c-2 2.2-3 5.2-3 9s1 6.8 3 9" />
      </>
    ),
    crown: (
      <>
        <path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 12H5Z" />
        <path d="M5 20h14" />
      </>
    )
  };

  return (
    <div className={`grid h-11 w-11 place-items-center border border-current/20 bg-black/24 ${stroke}`}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </div>
  );
}

function CompactLeaderboard({ players }: { players: Awaited<ReturnType<typeof getPlayers>> }) {
  return (
    <div className="glass-panel overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-sm">
        <thead className="bg-black/28 text-left text-xs uppercase tracking-[0.18em] text-purple-100/44">
          <tr>
            <th className="px-4 py-4">Rank</th>
            <th className="px-4 py-4">Player</th>
            <th className="px-4 py-4 text-right">Kills</th>
            <th className="px-4 py-4 text-right">Deaths</th>
            <th className="px-4 py-4 text-right">Points</th>
            <th className="px-4 py-4 text-right">Hours</th>
          </tr>
        </thead>
        <tbody>
          {players.length > 0 ? (
            players.map((player, index) => (
              <tr key={`${player.uuid}-${player.season}`} className="h-[76px] border-t border-purple-500/12 align-middle transition hover:bg-purple-500/[0.06]">
                <td className="px-4 py-0 align-middle font-black text-purple-200">#{index + 1}</td>
                <td className="px-4 py-0 align-middle">
                  <Link className="flex h-[76px] items-center gap-[14px] font-bold text-white hover:text-purple-200" href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}>
                    <PlayerHeadAvatar
                      username={player.username}
                      uuid={player.uuid}
                      skinUrl={player.skinUrl}
                      skinTexture={player.skinTexture}
                      skinTextureValue={player.skinTextureValue}
                      skinProvider={player.skinProvider}
                      platform={player.platform}
                      minecraftType={player.minecraftType}
                      javaUuid={player.javaUuid}
                      bedrockXuid={player.bedrockXuid}
                      xuid={player.xuid}
                      skinModel={player.skinModel}
                      size="table"
                    />
                    <span className="min-w-0 text-[clamp(0.86rem,1.4vw,1rem)] leading-none">{player.username}</span>
                  </Link>
                </td>
                <td className="px-4 py-0 text-right align-middle">{player.kills}</td>
                <td className="px-4 py-0 text-right align-middle text-red-200">{player.deaths}</td>
                <td className="px-4 py-0 text-right align-middle font-black text-purple-100">{player.points}</td>
                <td className="px-4 py-0 text-right align-middle">{formatHours(player.hoursOfGameplay)}</td>
              </tr>
            ))
          ) : (
            <tr className="border-t border-purple-500/12">
              <td colSpan={6} className="px-4 py-14 text-center">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto grid h-14 w-14 place-items-center border border-purple-300/24 bg-purple-950/24 text-purple-100/70 shadow-[0_0_28px_rgba(139,92,246,0.18)]">
                    <ShieldIcon />
                  </div>
                  <p className="mt-4 text-lg font-black text-white">Season has not started yet.</p>
                  <p className="mt-1 text-sm text-purple-100/56">Players will appear once they join the Havoc SMP server.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ChampionStrip() {
  return (
    <div className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <ChampionStep icon={<SwordsIcon />} title="Kill Players" />
      <ArrowDivider />
      <ChampionStep icon={<StarIcon />} title="Earn Points" />
      <ArrowDivider />
      <ChampionStep icon={<CrownMiniIcon />} title="Finish #1" />
    </div>
  );
}

function ChampionStep({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center border border-purple-300/20 bg-black/24 text-purple-100">{icon}</div>
      <div className="text-sm font-black text-white">{title}</div>
    </div>
  );
}

function ArrowDivider() {
  return <div className="hidden text-purple-100/35 sm:block">-&gt;</div>;
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z" />
      <path d="M12 7v10" />
    </svg>
  );
}

function SwordsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 20 7-7" />
      <path d="m14 6 4-4 2 2-4 4" />
      <path d="m5 4 15 15" />
      <path d="m14 18 4 4 2-2-4-4" />
      <path d="m4 4 4 4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9Z" />
    </svg>
  );
}

function CrownMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 12H5Z" />
      <path d="M5 20h14" />
    </svg>
  );
}
