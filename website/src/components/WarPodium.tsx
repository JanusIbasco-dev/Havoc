import Link from "next/link";
import type { LeaderboardPlayer } from "@/types/player";

type WarPodiumProps = {
  players: LeaderboardPlayer[];
  compact?: boolean;
};

const podiumStyles = [
  {
    rank: "#2",
    shell: "border-slate-200/45 bg-slate-200/[0.07] shadow-[0_0_42px_rgba(216,221,231,0.16)]",
    text: "text-slate-100"
  },
  {
    rank: "#1",
    shell: "border-yellow-300/60 bg-yellow-300/[0.1] shadow-[0_0_62px_rgba(245,196,81,0.34)] md:-mt-6",
    text: "text-yellow-100"
  },
  {
    rank: "#3",
    shell: "border-orange-300/45 bg-orange-300/[0.08] shadow-[0_0_42px_rgba(196,122,69,0.18)]",
    text: "text-orange-100"
  }
];

export function WarPodium({ players, compact = false }: WarPodiumProps) {
  const podiumPlayers = compact ? [players[0], players[1], players[2]] : [players[1], players[0], players[2]];
  const styles = compact ? [podiumStyles[1], podiumStyles[0], podiumStyles[2]] : podiumStyles;

  if (compact) {
    return <CompactPodium players={podiumPlayers} styles={styles} />;
  }

  return (
    <section className="grid gap-4 md:grid-cols-3 md:items-end">
      {styles.map((style, index) => {
        const player = podiumPlayers[index];
        return player ? (
          <Link
            key={player.uuid}
            href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
            className={`neon-hover rounded-3xl border p-6 transition duration-200 hover:-translate-y-2 ${style.shell}`}
          >
            <PodiumContent compact={compact} style={style} username={player.username} points={`${player.points} Points`} kills={`${player.kills} Kills`} uuid={player.uuid} skinUrl={player.skinUrl} />
          </Link>
        ) : (
          <div key={style.rank} className={`rounded-3xl border p-6 transition duration-200 hover:-translate-y-2 ${style.shell}`}>
            <PodiumContent compact={compact} style={style} username="Awaiting Player" points="No points yet" kills="No kills yet" />
          </div>
        );
      })}
    </section>
  );
}

function CompactPodium({ players, styles }: { players: Array<LeaderboardPlayer | undefined>; styles: typeof podiumStyles }) {
  const columns = [
    { player: players[1], style: styles[1], base: "h-14", label: "Silver" },
    { player: players[0], style: styles[0], base: "h-20", label: "Gold" },
    { player: players[2], style: styles[2], base: "h-10", label: "Bronze" }
  ];

  return (
    <section className="mb-12 mt-10 min-h-[380px] w-full overflow-visible pt-12">
      <div className="grid min-h-[320px] w-full grid-cols-[1fr_1.15fr_1fr] items-end gap-5 overflow-visible">
      {columns.map(({ player, style, base, label }) => {
        const gold = style.rank === "#1";
        const card = (
          <div className="flex w-full min-w-0 flex-col items-stretch">
            {player ? (
              <Link
                href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
                className={`neon-hover flex w-full min-w-0 overflow-hidden ${gold ? "h-[260px] translate-y-[-20px] border-yellow-300/70 shadow-[0_0_60px_rgba(245,196,81,0.3)]" : "h-[230px]"} flex-col items-center justify-start border bg-black/48 px-3 pb-3 pt-4 text-center backdrop-blur-md transition duration-200 hover:-translate-y-1 ${style.shell.replace(" md:-mt-6", "")}`}
              >
                {gold ? <CrownIcon /> : null}
                <PodiumContent compact style={style} username={player.username} points={`${player.points} Points`} kills={`${player.kills} Kills`} uuid={player.uuid} skinUrl={player.skinUrl} />
              </Link>
            ) : (
              <div className={`neon-hover flex w-full min-w-0 overflow-hidden ${gold ? "h-[260px] translate-y-[-20px] border-yellow-300/70 shadow-[0_0_60px_rgba(245,196,81,0.3)]" : "h-[230px]"} flex-col items-center justify-start border bg-black/48 px-3 pb-3 pt-4 text-center backdrop-blur-md transition duration-200 hover:-translate-y-1 ${style.shell.replace(" md:-mt-6", "")}`}>
                {gold ? <CrownIcon /> : null}
                <PodiumContent compact style={style} username="Awaiting Player" points="0 Points" kills="0 Kills" />
              </div>
            )}
            <div className={`${base} w-full border border-purple-500/18 bg-black/46 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`}>
              <div className={`h-full w-full ${label === "Gold" ? "bg-yellow-300/[0.08]" : label === "Silver" ? "bg-slate-200/[0.06]" : "bg-orange-300/[0.07]"}`} />
            </div>
          </div>
        );

        return <div key={style.rank} className="min-w-0">{card}</div>;
      })}
      </div>
    </section>
  );
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
          <img
            src={`https://mc-heads.net/body/${encodeURIComponent(username)}/120`}
            alt={`${username} skin render`}
            className={`${compact ? (style.rank === "#1" ? "max-h-[110px]" : "max-h-[95px]") : "max-h-full"} h-auto w-auto max-w-full object-contain drop-shadow-[0_0_24px_rgba(139,92,246,0.34)] [image-rendering:pixelated]`}
          />
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
