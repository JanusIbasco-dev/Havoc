export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-md bg-purple-500/15" />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="glass-panel h-96 animate-pulse rounded-lg" />
        <div className="space-y-4">
          <div className="glass-panel h-48 animate-pulse rounded-lg" />
          <div className="glass-panel h-64 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}
