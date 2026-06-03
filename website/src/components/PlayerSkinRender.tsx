type PlayerSkinRenderProps = {
  uuid: string;
  username: string;
  compact?: boolean;
};

export function PlayerSkinRender({ uuid, username, compact = false }: PlayerSkinRenderProps) {
  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-500/12 to-black/20 ${compact ? "min-h-36" : "min-h-72"}`}>
      <div className={`absolute inset-x-8 rounded-full bg-purple-500/20 blur-3xl ${compact ? "top-8 h-20" : "top-12 h-32"}`} />
      <img
        src={`https://crafatar.com/renders/body/${uuid}?overlay=true&scale=8`}
        alt={`${username} skin render`}
        className={`relative object-contain drop-shadow-[0_0_34px_rgba(139,92,246,0.45)] ${compact ? "max-h-32" : "max-h-64"}`}
      />
    </div>
  );
}
