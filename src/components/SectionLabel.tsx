type SectionLabelProps = {
  index: string;
  title: string;
};

export function SectionLabel({ index, title }: SectionLabelProps) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-[11px] tabular-nums text-[var(--accent-dim)]">
        {index}
      </span>
      <h2 className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
        {title}
      </h2>
    </div>
  );
}
