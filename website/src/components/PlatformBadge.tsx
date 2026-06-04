import type { LeaderboardPlayer } from "@/types/player";

type PlatformBadgeProps = {
  platform?: LeaderboardPlayer["platform"];
  compact?: boolean;
};

export function PlatformBadge({ platform = "java", compact = false }: PlatformBadgeProps) {
  const bedrock = platform === "bedrock";

  return (
    <span
      className={`inline-flex items-center border font-black uppercase tracking-[0.14em] ${
        compact ? "px-2 py-0.5 text-[0.58rem]" : "px-2.5 py-1 text-[0.65rem]"
      } ${
        bedrock
          ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
          : "border-emerald-300/24 bg-emerald-400/8 text-emerald-100/85"
      }`}
    >
      {bedrock ? "Bedrock" : "Java"}
    </span>
  );
}
