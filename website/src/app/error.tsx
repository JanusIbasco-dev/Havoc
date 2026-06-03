"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="glass-panel rounded-lg p-6">
      <h1 className="text-2xl font-black text-white">Something went wrong</h1>
      <p className="mt-2 text-sm text-purple-100/65">The leaderboard could not be loaded. Check the database connection and try again.</p>
      <button
        type="button"
        onClick={reset}
        className="neon-hover mt-5 rounded-md border border-purple-400/40 bg-purple-950/35 px-4 py-2 text-sm font-bold"
      >
        Retry
      </button>
    </div>
  );
}
