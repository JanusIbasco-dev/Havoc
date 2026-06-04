import Link from "next/link";
import { PlayerSkinRender } from "@/components/PlayerSkinRender";
import { PlatformBadge } from "@/components/PlatformBadge";
import type { LeaderboardPlayer } from "@/types/player";

type WarPodiumProps = {
  players: LeaderboardPlayer[];
  compact?: boolean;
};

const podiumStyles = [
  {
    rank: "#1",
    title: "Season Champion",
    order: "md:order-2",
    stage: "h-36 sm:h-40 border-yellow-200/60 bg-[linear-gradient(180deg,rgba(250,204,21,0.94),rgba(161,98,7,0.9)_45%,rgba(63,39,12,0.98))] shadow-[0_0_60px_rgba(250,204,21,0.38),inset_0_8px_0_rgba(255,255,255,0.18),inset_0_-16px_0_rgba(0,0,0,0.18)]",
    cap: "from-yellow-100 to-yellow-400",
    glow: "bg-yellow-300/24",
    rankText: "text-yellow-50",
    skinSize: "champion" as const,
    lift: "md:-translate-y-8",
    crown: true
  },
  {
    rank: "#2",
    title: "Silver",
    order: "md:order-1",
    stage: "h-28 sm:h-32 border-slate-100/46 bg-[linear-gradient(180deg,rgba(226,232,240,0.88),rgba(100,116,139,0.88)_48%,rgba(30,41,59,0.98))] shadow-[0_0_40px_rgba(226,232,240,0.18),inset_0_8px_0_rgba(255,255,255,0.16),inset_0_-14px_0_rgba(0,0,0,0.2)]",
    cap: "from-white to-slate-300",
    glow: "bg-slate-200/18",
    rankText: "text-slate-50",
    skinSize: "contender" as const,
    lift: "md:translate-y-4",
    crown: false
  },
  {
    rank: "#3",
    title: "Bronze",
    order: "md:order-3",
    stage: "h-24 sm:h-28 border-orange-200/46 bg-[linear-gradient(180deg,rgba(251,146,60,0.9),rgba(154,52,18,0.9)_50%,rgba(67,30,18,0.98))] shadow-[0_0_40px_rgba(251,146,60,0.18),inset_0_8px_0_rgba(255,255,255,0.14),inset_0_-14px_0_rgba(0,0,0,0.2)]",
    cap: "from-orange-100 to-orange-400",
    glow: "bg-orange-300/18",
    rankText: "text-orange-50",
    skinSize: "contender" as const,
    lift: "md:translate-y-8",
    crown: false
  }
];

const sparks = Array.from({ length: 18 }, (_, index) => index);
const confetti = Array.from({ length: 16 }, (_, index) => index);

export function WarPodium({ players }: WarPodiumProps) {
  const entries = players.slice(0, 3).map((player, index) => ({
    player,
    style: podiumStyles[index]
  }));

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="relative min-h-[680px] overflow-hidden rounded-2xl border border-purple-300/20 bg-black/58 px-4 py-8 shadow-[0_0_80px_rgba(139,92,246,0.22)] backdrop-blur-md sm:px-8 lg:min-h-[650px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(250,204,21,0.16),transparent_18%),radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.28),transparent_38%),linear-gradient(180deg,rgba(17,7,35,0.2),rgba(3,2,8,0.88))]" />
        <CastleBackdrop />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.28),transparent_58%),linear-gradient(180deg,transparent,rgba(3,2,8,0.95))]" />
        <div className="absolute left-1/2 top-14 hidden h-[520px] w-[360px] -translate-x-1/2 bg-[conic-gradient(from_200deg_at_50%_0%,transparent_0deg,rgba(250,204,21,0.2)_18deg,transparent_38deg,transparent_322deg,rgba(250,204,21,0.18)_342deg,transparent_360deg)] blur-sm md:block" />
        <Fireworks />

        <div className="pointer-events-none absolute inset-0">
          {sparks.map((spark) => (
            <span
              key={spark}
              className="ceremony-spark absolute h-1.5 w-1.5 rounded-full bg-purple-200/80 shadow-[0_0_12px_rgba(216,180,254,0.7)]"
              style={{
                left: `${8 + ((spark * 17) % 86)}%`,
                top: `${16 + ((spark * 23) % 54)}%`,
                animationDelay: `${spark * 0.23}s`
              }}
            />
          ))}
          {confetti.map((piece) => (
            <span
              key={piece}
              className="ceremony-confetti absolute h-2.5 w-1 rounded-sm"
              style={{
                left: `${4 + ((piece * 19) % 92)}%`,
                backgroundColor: piece % 3 === 0 ? "#facc15" : piece % 3 === 1 ? "#a78bfa" : "#fb923c",
                animationDelay: `${piece * 0.37}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-purple-200/70">Hall of Champions</p>
          <h3 className="mt-2 text-3xl font-black text-white sm:text-5xl">Top 3 Players</h3>
        </div>

        <div className="relative z-10 mt-10 grid gap-8 md:grid-cols-3 md:items-end md:gap-4 lg:gap-8">
          {entries.map(({ player, style }) => (
            <ChampionStand key={`${player.uuid}-${player.season}`} player={player} style={style} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChampionStand({ player, style }: { player: LeaderboardPlayer; style: (typeof podiumStyles)[number] }) {
  return (
    <Link
      href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
      className={`group relative flex min-w-0 flex-col items-center ${style.order} ${style.lift}`}
    >
      {style.crown ? (
        <div className="ceremony-crown absolute -top-12 z-30 text-5xl font-black text-yellow-200 drop-shadow-[0_0_24px_rgba(250,204,21,0.75)]">♛</div>
      ) : null}

      <div className={`absolute top-14 h-48 w-48 rounded-full blur-3xl ${style.glow}`} />
      <div className="ceremony-idle relative z-20 drop-shadow-[0_18px_28px_rgba(0,0,0,0.42)]">
        <PlayerSkinRender
          uuid={player.uuid}
          username={player.username}
          skinUrl={player.skinUrl}
          skinProvider={player.skinProvider}
          platform={player.platform}
          podium
          podiumSize={style.skinSize}
        />
      </div>

      <div className="relative z-10 -mt-2 w-full max-w-[330px]">
        <div className={`absolute inset-x-4 -top-3 h-6 rounded-[50%] bg-gradient-to-r ${style.cap} opacity-90 blur-[1px]`} />
        <div className={`relative overflow-hidden rounded-lg border ${style.stage}`}>
          <div className="absolute inset-x-0 top-0 h-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent)]" />
          <div className="absolute inset-0 opacity-18 [background-image:linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.18)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
            <p className={`text-4xl font-black leading-none ${style.rankText}`}>{style.rank}</p>
            <h4 className="mt-2 w-full truncate text-2xl font-black text-white" title={player.username}>
              {player.username}
            </h4>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <PlatformBadge platform={player.platform} compact />
              <span className="text-xs font-black uppercase tracking-[0.16em] text-white/70">{style.title}</span>
            </div>
            <p className="mt-2 w-full truncate text-sm font-black text-white/84">
              {player.points} pts <span className="mx-1 text-white/42">&bull;</span> {player.kills} {player.kills === 1 ? "kill" : "kills"} <span className="mx-1 text-white/42">&bull;</span> {player.deaths} {player.deaths === 1 ? "death" : "deaths"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CastleBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 h-72 opacity-50 blur-[1px]">
      <div className="absolute bottom-0 left-[7%] h-40 w-24 bg-purple-950/70" />
      <div className="absolute bottom-0 left-[17%] h-56 w-28 bg-purple-950/75" />
      <div className="absolute bottom-0 left-[31%] h-44 w-24 bg-purple-950/70" />
      <div className="absolute bottom-0 right-[31%] h-44 w-24 bg-purple-950/70" />
      <div className="absolute bottom-0 right-[17%] h-56 w-28 bg-purple-950/75" />
      <div className="absolute bottom-0 right-[7%] h-40 w-24 bg-purple-950/70" />
      <div className="absolute bottom-0 left-1/2 h-64 w-40 -translate-x-1/2 bg-purple-950/80" />
      <div className="absolute bottom-56 left-1/2 h-12 w-12 -translate-x-1/2 rotate-45 bg-purple-950/80" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-purple-950/80" />
    </div>
  );
}

function Fireworks() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <span className="ceremony-firework absolute left-[18%] top-[18%]" />
      <span className="ceremony-firework absolute right-[18%] top-[24%] [animation-delay:1.4s]" />
      <span className="ceremony-firework absolute left-[56%] top-[16%] [animation-delay:2.7s]" />
    </div>
  );
}
