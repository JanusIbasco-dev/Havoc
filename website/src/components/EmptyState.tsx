export function EmptyState() {
  return (
    <div className="glass-panel relative overflow-hidden p-8 text-center">
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/16 blur-3xl" />
      <div className="relative mx-auto grid h-14 w-14 place-items-center border border-purple-300/24 bg-purple-950/24 text-purple-100/70 shadow-[0_0_28px_rgba(139,92,246,0.18)]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z" />
          <path d="M12 7v10" />
        </svg>
      </div>
      <p className="relative mt-4 text-lg font-black text-white">Season has not started yet.</p>
      <p className="relative mt-1 text-sm text-purple-100/56">Players will appear once they join the Havoc SMP server.</p>
    </div>
  );
}
