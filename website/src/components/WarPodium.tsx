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
    order: "",
    layout: "col-span-2",
    block: "h-[86px] border-yellow-200/56 bg-[linear-gradient(180deg,rgba(250,204,21,0.94),rgba(161,98,7,0.9)_48%,rgba(63,39,12,0.96))] shadow-[0_12px_24px_rgba(0,0,0,0.28),0_0_24px_rgba(250,204,21,0.16),inset_0_6px_0_rgba(255,255,255,0.16)]",
    cap: "from-yellow-100 to-yellow-400",
    glow: "bg-yellow-300/22",
    rankText: "text-yellow-50",
    skinSize: "champion" as const,
    lift: "",
    crown: true
  },
  {
    rank: "#2",
    order: "",
    layout: "",
    block: "h-[74px] border-slate-100/42 bg-[linear-gradient(180deg,rgba(226,232,240,0.9),rgba(100,116,139,0.88)_50%,rgba(30,41,59,0.96))] shadow-[0_10px_20px_rgba(0,0,0,0.26),0_0_16px_rgba(226,232,240,0.1),inset_0_6px_0_rgba(255,255,255,0.12)]",
    cap: "from-white to-slate-300",
    glow: "bg-slate-200/12",
    rankText: "text-slate-50",
    skinSize: "contender" as const,
    lift: "",
    crown: false
  },
  {
    rank: "#3",
    order: "",
    layout: "",
    block: "h-[74px] border-orange-200/42 bg-[linear-gradient(180deg,rgba(251,146,60,0.9),rgba(154,52,18,0.9)_50%,rgba(67,30,18,0.96))] shadow-[0_10px_20px_rgba(0,0,0,0.26),0_0_16px_rgba(251,146,60,0.1),inset_0_6px_0_rgba(255,255,255,0.12)]",
    cap: "from-orange-100 to-orange-400",
    glow: "bg-orange-300/12",
    rankText: "text-orange-50",
    skinSize: "contender" as const,
    lift: "",
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
    <section className="relative w-full max-h-[420px] overflow-visible pt-1">
      <div className="pointer-events-none absolute inset-x-0 top-12 mx-auto h-48 max-w-sm bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.16),transparent_64%)]" />
      <div className="pointer-events-none absolute left-1/2 top-2 hidden h-56 w-44 -translate-x-1/2 bg-[conic-gradient(from_205deg_at_50%_0%,transparent_0deg,rgba(250,204,21,0.08)_18deg,transparent_40deg,transparent_320deg,rgba(250,204,21,0.07)_342deg,transparent_360deg)] md:block" />

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
        <span className="ceremony-firework absolute right-[10%] top-[8%] opacity-45" style={{ animationDuration: "14s" }} />
      </div>

      <div className="absolute inset-x-4 bottom-0 h-3 rounded-full bg-purple-950/70 shadow-[0_0_18px_rgba(139,92,246,0.16)]" />

      <div className="relative z-10 grid min-h-[386px] grid-cols-2 items-end gap-x-4 gap-y-2">
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
      className={`group relative flex min-w-0 flex-col items-center ${style.layout} ${style.order} ${style.lift}`}
    >
      {style.crown ? (
        <div className="ceremony-crown absolute -top-7 z-30 text-3xl font-black text-yellow-200 drop-shadow-[0_0_14px_rgba(250,204,21,0.62)]">♛</div>
      ) : null}

      <div className={`absolute top-12 h-28 w-28 rounded-full blur-2xl ${style.glow}`} />
      <div className="ceremony-idle relative z-20 -mb-1 drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)]">
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

      <div className="relative z-10 w-full max-w-[300px]">
        <div className={`absolute inset-x-4 -top-2 h-5 rounded-[50%] bg-gradient-to-r ${style.cap} opacity-90 blur-[1px]`} />
        <div className={`relative overflow-hidden rounded-lg border ${style.block}`}>
          <div className="absolute inset-x-0 top-0 h-7 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
          <div className="absolute inset-0 opacity-14 [background-image:linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.16)_1px,transparent_1px)] [background-size:30px_30px]" />
          <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
            <p className={`text-2xl font-black leading-none ${style.rankText}`}>{style.rank}</p>
            <h4 className="mt-1 max-w-full text-balance break-words text-sm font-black leading-tight text-white sm:text-base" title={player.username}>
              {player.username}
            </h4>
            <p className="mt-0.5 text-xs font-black text-white/86 sm:text-sm">{player.points} pts</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
