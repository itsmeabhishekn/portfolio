type ProjectArchitectureProps = {
  title: string;
};

export function ProjectArchitecture({ title }: ProjectArchitectureProps) {
  return (
    <div
      className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-deep)]"
      aria-hidden
    >
      <svg
        viewBox="0 0 320 200"
        className="h-full w-full text-[var(--muted)]"
        fill="none"
      >
        <defs>
          <linearGradient id="wire" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <rect
          x="12"
          y="12"
          width="296"
          height="176"
          rx="6"
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        <rect
          x="28"
          y="32"
          width="72"
          height="40"
          rx="4"
          stroke="url(#wire)"
          strokeWidth="1.2"
        />
        <rect
          x="124"
          y="28"
          width="88"
          height="48"
          rx="4"
          stroke="var(--accent)"
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />
        <rect
          x="232"
          y="32"
          width="72"
          height="40"
          rx="4"
          stroke="url(#wire)"
          strokeWidth="1.2"
        />
        <rect
          x="48"
          y="112"
          width="96"
          height="36"
          rx="4"
          stroke="currentColor"
          strokeOpacity="0.25"
        />
        <rect
          x="176"
          y="112"
          width="96"
          height="36"
          rx="4"
          stroke="currentColor"
          strokeOpacity="0.25"
        />
        <path
          d="M64 72v28c0 8 6 14 14 14h46M256 72v28c0 8-6 14-14 14h-46M160 76v20"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <circle cx="160" cy="104" r="3" fill="var(--accent)" fillOpacity="0.7" />
        <text
          x="160"
          y="168"
          textAnchor="middle"
          fill="currentColor"
          className="font-mono text-[9px] opacity-50"
        >
          topology: {title.slice(0, 18)}
        </text>
      </svg>
    </div>
  );
}
