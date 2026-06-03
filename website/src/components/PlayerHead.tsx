type PlayerHeadProps = {
  username: string;
  uuid?: string;
  skinUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-14 w-14",
  lg: "h-24 w-24"
};

export function PlayerHead({ username, uuid, skinUrl, size = "md" }: PlayerHeadProps) {
  const src = `https://mc-heads.net/avatar/${encodeURIComponent(username)}/64`;

  if (src) {
    return <img src={src} alt={`${username} head`} className={`${sizes[size]} border border-purple-400/35 bg-black object-cover shadow-[0_0_28px_rgba(139,92,246,0.24)] [image-rendering:pixelated]`} />;
  }

  return (
    <div className={`${sizes[size]} grid place-items-center rounded-2xl border border-purple-400/35 bg-purple-950/35 text-sm font-black text-[var(--accent-strong)] shadow-[0_0_28px_rgba(139,92,246,0.24)]`}>
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}
