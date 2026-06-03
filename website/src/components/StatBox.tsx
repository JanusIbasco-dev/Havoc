type StatBoxProps = {
  label: string;
  value: string | number;
};

export function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="glass-panel neon-hover rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wide text-purple-200/55">{label}</div>
      <div className="mt-2 text-2xl font-black text-[var(--accent-strong)]">{value}</div>
    </div>
  );
}
