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
    shell: "border-yellow-300/60 bg-yellow-300/[0.1] shadow-[0_0_62px_rgba(245,196,81,0.34)] md:-mt-6",
    text: "text-yellow-100",
    base: "h-20",
    label: "Gold"
  },
  {
    rank: "#2",
    shell: "border-slate-200/45 bg-slate-200/[0.07] shadow-[0_0_42px_rgba(216,221,231,0.16)]",
    text: "text-slate-100",
    base: "h-14",
    label: "Silver"
  },
  {
    rank: "#3",
    shell: "border-orange-300/45 bg-orange-300/[0.08] shadow-[0_0_42px_rgba(196,122,69,0.18)]",
    text: "text-orange-100",
    base: "h-10",
    label: "Bronze"
  }
];

export function WarPodium({ players, compact = false }: WarPodiumProps) {
  const rankedPlayers = players.slice(0, 3).map((player, index) => ({ player, style: podiumStyles[index] }));
  const displayPlayers = rankedPlayers.length === 3 ? [rankedPlayers[1], rankedPlayers[0], rankedPlayers[2]] : rankedPlayers;

  if (compact) {
    return <CompactPodium entries={displayPlayers} />;
  }

  return (
    <section className={podiumGridClass(displayPlayers.length)}>
      {displayPlayers.map(({ player, style }) => (
          <Link
            key={player.uuid}
            href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
            className={`neon-hover rounded-3xl border p-6 transition duration-200 hover:-translate-y-2 ${style.shell}`}
          >
            <PodiumContent compact={compact} style={style} username={player.username} points={`${player.points} Points`} kills={`${player.kills} Kills`} uuid={player.uuid} skinUrl={player.skinUrl} />
          </Link>
      ))}
    </section>
  );
}

function CompactPodium({ entries }: { entries: Array<{ player: LeaderboardPlayer; style: (typeof podiumStyles)[number] }> }) {
  return (
    <section className="mb-12 mt-10 min-h-[380px] w-full overflow-visible pt-12">
      <div className={`${podiumGridClass(entries.length)} min-h-[320px] w-full items-end overflow-visible`}>
      {entries.map(({ player, style }) => {
        const gold = style.rank === "#1";
        return (
          <div key={player.uuid} className="min-w-0">
          <div className="flex w-full min-w-0 flex-col items-stretch">
              <Link
                href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
                className={`neon-hover flex w-full min-w-0 overflow-hidden ${gold ? "h-[260px] translate-y-[-20px] border-yellow-300/70 shadow-[0_0_60px_rgba(245,196,81,0.3)]" : "h-[230px]"} flex-col items-center justify-start border bg-black/48 px-3 pb-3 pt-4 text-center backdrop-blur-md transition duration-200 hover:-translate-y-1 ${style.shell.replace(" md:-mt-6", "")}`}
              >
                {gold ? <CrownIcon /> : null}
                <PodiumContent compact style={style} username={player.username} points={`${player.points} Points`} kills={`${player.kills} Kills`} uuid={player.uuid} skinUrl={player.skinUrl} />
              </Link>
            <div className={`${style.base} w-full border border-purple-500/18 bg-black/46 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`}>
              <div className={`h-full w-full ${style.label === "Gold" ? "bg-yellow-300/[0.08]" : style.label === "Silver" ? "bg-slate-200/[0.06]" : "bg-orange-300/[0.07]"}`} />
            </div>
          </div>
          </div>
        );
      })}
      </div>
    </section>
  );
}

function podiumGridClass(count: number) {
  if (count <= 1) {
    return "grid grid-cols-1 justify-items-center gap-5 md:[&>*]:max-w-[360px]";
  }

  if (count === 2) {
    return "grid gap-5 sm:grid-cols-2";
  }

  return "grid gap-5 md:grid-cols-[1fr_1.15fr_1fr]";
}

function PodiumContent({
  style,
  username,
  points,
  kills,
  uuid,
  skinUrl,
  compact
}: {
  style: (typeof podiumStyles)[number];
  username: string;
  points: string;
  kills: string;
  uuid?: string;
  skinUrl?: string | null;
  compact?: boolean;
}) {
  return (
    <>
      <div className={compact ? "relative text-center" : "flex items-center justify-between"}>
        <span className={`${compact ? "text-2xl" : "text-3xl"} font-black ${style.text}`}>{style.rank}</span>
      </div>
      <div className={`${compact ? "relative mt-3 flex-col text-center" : "mt-6"} flex items-center gap-4`}>
        <div className={`${compact ? (style.rank === "#1" ? "h-[110px] w-full" : "h-[95px] w-full") : "h-36 w-28"} grid shrink-0 place-items-center overflow-hidden bg-black/10`}>
          {uuid ? <PlayerSkinRender uuid={uuid} username={username} skinUrl={skinUrl} compact /> : null}
        </div>
        <div className={`min-w-0 flex-1 ${compact ? "text-center" : "text-left"}`}>
          <h3 className={`${compact ? "max-w-full truncate whitespace-nowrap text-xs font-semibold sm:text-sm" : "text-2xl break-words font-black"} leading-tight text-white`}>{username}</h3>
          <p className={`${compact ? "mt-2 text-xs" : "mt-1 text-sm"} text-purple-100/60`}>{points}</p>
          <p className={`${compact ? "text-xs" : "text-sm"} text-purple-100/42`}>{kills}</p>
        </div>
      </div>
    </>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mb-1 h-7 w-7 text-yellow-100 drop-shadow-[0_0_16px_rgba(245,196,81,0.82)]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 12H5Z" />
      <path d="M5 20h14" />
    </svg>
  );
}
