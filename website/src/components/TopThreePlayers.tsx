import Link from "next/link";
import { PlayerBodyPreview } from "@/components/PlayerBodyPreview";
import type { LeaderboardPlayer } from "@/types/player";

type TopThreePlayersProps = {
  players: LeaderboardPlayer[];
};

const styles = [
  { label: "Gold", className: "min-h-[154px] border-yellow-300/40 bg-yellow-300/[0.08] text-yellow-100", glow: "shadow-[0_0_40px_rgba(245,196,81,0.14)]" },
  { label: "Silver", className: "min-h-[138px] border-slate-200/32 bg-slate-200/[0.08] text-slate-100", glow: "shadow-[0_0_40px_rgba(216,221,231,0.1)]" },
  { label: "Bronze", className: "min-h-[138px] border-orange-300/32 bg-orange-300/[0.08] text-orange-100", glow: "shadow-[0_0_40px_rgba(196,122,69,0.12)]" }
];

export function TopThreePlayers({ players }: TopThreePlayersProps) {
  const topThree = players.slice(0, 3);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {topThree.map((player, index) => {
        const style = styles[index];
        return (
          <Link
            href={`/players/${encodeURIComponent(player.username)}?season=${encodeURIComponent(String(player.season))}`}
            key={`${player.uuid}-${player.season}`}
            className={`neon-hover grid items-center rounded-3xl border p-5 ${style.className} ${style.glow}`}
          >
            <div className="grid grid-cols-[54px_minmax(0,1fr)_92px] items-center gap-4">
              <div className="grid gap-2">
                <span className="grid h-12 w-12 place-items-center rounded-lg border border-white/16 bg-black/30 text-xl font-black">#{index + 1}</span>
                <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] opacity-70">{style.label}</span>
              </div>
              <div className="min-w-0 self-center">
                <h3 className="truncate text-[clamp(1.22rem,2.1vw,1.62rem)] font-black leading-tight text-white">{player.username}</h3>
                <p className="mt-1 text-sm font-black opacity-85">{player.points} points</p>
                <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-60">{player.kills} kills</p>
              </div>
              <div className={`ranking-preview-frame top-rank-preview-frame ${rankingPreviewClass(index)}`}>
                <PlayerBodyPreview player={player} size={136} className="ranking-body-preview top-rank-body-preview" />
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}

function rankingPreviewClass(index: number) {
  return index === 0 ? "ranking-preview-gold" : index === 1 ? "ranking-preview-silver" : "ranking-preview-bronze";
}
