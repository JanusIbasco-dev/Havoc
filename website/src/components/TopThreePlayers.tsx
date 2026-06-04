import Link from "next/link";
import { PlayerHeadAvatar } from "@/components/PlayerHeadAvatar";
import type { LeaderboardPlayer } from "@/types/player";

type TopThreePlayersProps = {
  players: LeaderboardPlayer[];
};

const styles = [
  { label: "Gold", className: "border-yellow-300/45 bg-yellow-300/10 text-yellow-100", glow: "shadow-[0_0_40px_rgba(245,196,81,0.16)]" },
  { label: "Silver", className: "border-slate-200/35 bg-slate-200/10 text-slate-100", glow: "shadow-[0_0_40px_rgba(216,221,231,0.12)]" },
  { label: "Bronze", className: "border-orange-300/35 bg-orange-300/10 text-orange-100", glow: "shadow-[0_0_40px_rgba(196,122,69,0.14)]" }
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
            className={`neon-hover rounded-3xl border p-5 ${style.className} ${style.glow}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em]">{style.label}</span>
              <span className="text-2xl font-black">#{index + 1}</span>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <PlayerHeadAvatar username={player.username} uuid={player.uuid} skinUrl={player.skinUrl} skinTexture={player.skinTexture} skinTextureValue={player.skinTextureValue} skinProvider={player.skinProvider} platform={player.platform} minecraftType={player.minecraftType} javaUuid={player.javaUuid} bedrockXuid={player.bedrockXuid} xuid={player.xuid} skinModel={player.skinModel} size="top3" />
              <div className="min-w-0">
                <h3 className="truncate text-2xl font-black text-white">{player.username}</h3>
                <p className="mt-1 text-sm opacity-80">{player.points} points</p>
                <p className="text-sm opacity-70">{player.kills} kills</p>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
