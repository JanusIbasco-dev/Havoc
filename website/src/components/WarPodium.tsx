import Link from "next/link";
import { PlayerSkinRender } from "@/components/PlayerSkinRender";
import type { LeaderboardPlayer } from "@/types/player";

type WarPodiumProps = {
  players: LeaderboardPlayer[];
  compact?: boolean;
};

const podiumStyles = [
  {
    rank: "#1",
    order: "md:order-2",
    block: "h-[120px] border-yellow-200/58 bg-[linear-gradient(180deg,rgba(250,204,21,0.94),rgba(161,98,7,0.9)_48%,rgba(63,39,12,0.96))] shadow-[0_18px_34px_rgba(0,0,0,0.32),0_0_34px_rgba(250,204,21,0.22),inset_0_7px_0_rgba(255,255,255,0.18)]",
    cap: "from-yellow-100 to-yellow-400",
    glow: "bg-yellow-300/22",
    rankText: "text-yellow-50",
    skinSize: "champion" as const,
    lift: "md:-translate-y-5",
    crown: true
  },
  {
    rank: "#2",
    order: "md:order-1",
    block: "h-[100px] border-slate-100/44 bg-[linear-gradient(180deg,rgba(226,232,240,0.9),rgba(100,116,139,0.88)_50%,rgba(30,41,59,0.96))] shadow-[0_14px_28px_rgba(0,0,0,0.3),0_0_22px_rgba(226,232,240,0.12),inset_0_7px_0_rgba(255,255,255,0.14)]",
    cap: "from-white to-slate-300",
    glow: "bg-slate-200/12",
    rankText: "text-slate-50",
    skinSize: "contender" as const,
    lift: "md:translate-y-4",
    crown: false
  },
  {
    rank: "#3",
    order: "md:order-3",
    block: "h-[100px] border-orange-200/44 bg-[linear-gradient(180deg,rgba(251,146,60,0.9),rgba(154,52,18,0.9)_50%,rgba(67,30,18,0.96))] shadow-[0_14px_28px_rgba(0,0,0,0.3),0_0_22px_rgba(251,146,60,0.12),inset_0_7px_0_rgba(255,255,255,0.14)]",
    cap: "from-orange-100 to-orange-400",
    glow: "bg-orange-300/12",
    rankText: "text-orange-50",
    skinSize: "contender" as const,
    lift: "md:translate-y-4",
    crown: false
  }
];

const sparks = Array.from({ length: 8 }, (_, index) => index);

export function WarPodium({ players }: WarPodiumProps) {
  const entries = players.slice(0, 3).map((player, index) => ({
    player,
    style: podiumStyles[index]
  }));

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-visible py-4">
      <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-72 max-w-4xl bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.2),transparent_62%)]" />
      <div className="pointer-events-none absolute left-1/2 top-3 hidden h-80 w-64 -translate-x-1/2 bg-[conic-gradient(from_205deg_at_50%_0%,transparent_0deg,rgba(250,204,21,0.12)_18deg,transparent_40deg,transparent_320deg,rgba(250,204,21,0.1)_342deg,transparent_360deg)] md:block" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {sparks.map((spark) => (
          <span
            key={spark}
            className="ceremony-spark absolute h-1 w-1 rounded-full bg-purple-200/70 shadow-[0_0_10px_rgba(216,180,254,0.55)]"
            style={{
              left: `${14 + ((spark * 13) % 72)}%`,
              top: `${20 + ((spark * 17) % 42)}%`,
              animationDelay: `${spark * 0.45}s`,
              animationDuration: "6s"
            }}
          />
        ))}
        <span className="ceremony-firework absolute right-[12%] top-[10%] opacity-60" style={{ animationDuration: "10s" }} />
      </div>

      <div className="relative z-10 grid min-h-[470px] gap-6 md:grid-cols-3 md:items-end md:gap-5">
        {entries.map(({ player, style }) => (
          <PodiumPlacement key={`${player.uuid}-${player.season}`} player={player} style={style} />
        ))}
      </div>
    </section>
  );
}

function PodiumPlacement({ player, style }: { player: LeaderboardPlayer; style: (typeof podiumStyles)[number] }) {
  return (
    <Link
      href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
      className={`group relative flex min-w-0 flex-col items-center ${style.order} ${style.lift}`}
    >
      {style.crown ? (
        <div className="ceremony-crown absolute -top-9 z-30 text-4xl font-black text-yellow-200 drop-shadow-[0_0_18px_rgba(250,204,21,0.68)]">♛</div>
      ) : null}

      <div className={`absolute top-14 h-44 w-44 rounded-full blur-3xl ${style.glow}`} />
      <div className="ceremony-idle relative z-20 -mb-1 drop-shadow-[0_14px_24px_rgba(0,0,0,0.38)]">
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

      <div className="relative z-10 w-full max-w-[320px]">
        <div className={`absolute inset-x-5 -top-3 h-6 rounded-[50%] bg-gradient-to-r ${style.cap} opacity-90 blur-[1px]`} />
        <div className={`relative overflow-hidden rounded-lg border ${style.block}`}>
          <div className="absolute inset-x-0 top-0 h-7 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
          <div className="absolute inset-0 opacity-14 [background-image:linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.16)_1px,transparent_1px)] [background-size:30px_30px]" />
          <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
            <p className={`text-3xl font-black leading-none ${style.rankText}`}>{style.rank}</p>
            <h4 className="mt-2 max-w-full break-words text-xl font-black leading-tight text-white sm:text-2xl" title={player.username}>
              {player.username}
            </h4>
            <p className="mt-1 text-sm font-black text-white/86 sm:text-base">{player.points} Points</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
