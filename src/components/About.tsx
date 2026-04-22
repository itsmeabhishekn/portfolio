import { MotionSection } from "@/components/MotionSection";
import { SectionLabel } from "@/components/SectionLabel";

export function About() {
  return (
    <MotionSection
      id="about"
      className="border-b border-[var(--border)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionLabel index="01" title="About" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(0,280px)] lg:items-start">
          <p className="max-w-2xl text-[17px] leading-[1.75] text-[var(--muted)]">
            Software engineer experienced in backend engineering, distributed
            systems, microservices, performance optimization, Kafka, Redis,
            Docker, MongoDB, and scalable application architecture.
          </p>
          <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 font-mono text-[12px] leading-relaxed text-[var(--muted)]">
            <div className="mb-3 flex items-center gap-2 text-[var(--foreground)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="text-[11px] uppercase tracking-widest">
                system.context
              </span>
            </div>
            <p className="border-l-2 border-[var(--accent-dim)] pl-3 text-[var(--muted)]">
              Focus: reliability, observability, and interfaces that stay calm
              under load.
            </p>
          </aside>
        </div>
      </div>
    </MotionSection>
  );
}
