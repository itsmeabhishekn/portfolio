export function SiteBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[var(--bg)]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 0%, black 20%, transparent 70%)",
        }}
      />
      <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-[var(--glow-1)] blur-[100px]" />
      <div className="absolute -right-24 bottom-1/3 h-64 w-64 rounded-full bg-[var(--glow-2)] blur-[90px]" />
    </div>
  );
}
