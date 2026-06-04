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
    block: "h-[86px] border-yellow-200/52 bg-[linear-gradient(180deg,rgba(43,39,52,0.98),rgba(22,19,29,0.98))] shadow-[0_12px_24px_rgba(0,0,0,0.3),0_0_22px_rgba(250,204,21,0.18),inset_0_6px_0_rgba(255,255,255,0.08),inset_0_-7px_0_rgba(0,0,0,0.22)]",
    trim: "bg-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.24)]",
    cap: "from-yellow-100 via-yellow-300 to-yellow-600",
    glow: "bg-yellow-300/18",
    rankText: "text-yellow-50",
    skinSize: "champion" as const,
    lift: "",
    crown: true
  },
  {
    rank: "#2",
    order: "",
    layout: "",
    block: "h-[74px] border-slate-100/36 bg-[linear-gradient(180deg,rgba(41,39,49,0.98),rgba(21,20,28,0.98))] shadow-[0_10px_20px_rgba(0,0,0,0.28),0_0_15px_rgba(226,232,240,0.1),inset_0_6px_0_rgba(255,255,255,0.07),inset_0_-7px_0_rgba(0,0,0,0.22)]",
    trim: "bg-slate-200 shadow-[0_0_14px_rgba(226,232,240,0.16)]",
    cap: "from-white via-slate-300 to-slate-500",
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
    block: "h-[74px] border-orange-200/36 bg-[linear-gradient(180deg,rgba(43,36,32,0.98),rgba(23,19,24,0.98))] shadow-[0_10px_20px_rgba(0,0,0,0.28),0_0_15px_rgba(251,146,60,0.1),inset_0_6px_0_rgba(255,255,255,0.07),inset_0_-7px_0_rgba(0,0,0,0.22)]",
    trim: "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.16)]",
    cap: "from-orange-100 via-orange-400 to-orange-700",
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

      <div className="absolute inset-x-2 bottom-0 h-7 rounded-lg border border-purple-300/14 bg-[linear-gradient(180deg,rgba(35,31,45,0.92),rgba(13,11,18,0.98))] shadow-[0_14px_28px_rgba(0,0,0,0.28),0_0_20px_rgba(139,92,246,0.12),inset_0_5px_0_rgba(255,255,255,0.06)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-purple-300/22" />
        <div className="absolute inset-0 opacity-12 [background-image:linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.28)_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

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
        <div className={`absolute inset-x-4 -top-2 h-5 rounded-[50%] bg-gradient-to-r ${style.cap} opacity-95 shadow-[0_4px_10px_rgba(0,0,0,0.28)]`} />
        <div className={`relative overflow-hidden rounded-lg border ${style.block}`}>
          <div className={`absolute inset-x-0 top-0 h-1.5 ${style.trim}`} />
          <div className="absolute inset-x-0 top-1.5 h-7 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
          <div className="absolute inset-0 opacity-18 [background-image:linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.24)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-purple-400/18 shadow-[0_0_12px_rgba(139,92,246,0.32)]" />
          <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
            <p className={`text-2xl font-black leading-none ${style.rankText}`}>{style.rank}</p>
            <h4 className="mt-1 max-w-full whitespace-nowrap text-sm font-black leading-tight text-white sm:text-base" title={player.username}>
              {player.username}
            </h4>
            <p className="mt-0.5 text-xs font-black text-white/86 sm:text-sm">{player.points} pts</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
