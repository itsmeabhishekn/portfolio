import { MotionSection } from "@/components/MotionSection";
import { SectionHeading } from "@/components/SectionLabel";
import { about, site } from "@/data/portfolio";

export function About() {
  return (
    <MotionSection
      id="about"
      className="border-b border-[var(--border)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="About"
          title="Backend first. Systems that stay calm."
          subtitle="A short look at how I work and what I'm looking for next."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-14">
          <div>
            <p className="max-w-2xl text-base leading-[1.85] text-[var(--muted)] sm:text-lg">
              {about.body}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3.5 py-1.5 text-sm font-medium text-[var(--accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {site.availability}
              </span>
              <a
                href={site.resumeHref}
                download
                className="text-sm font-medium text-[var(--foreground)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
              >
                Preview / Download resume
              </a>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-1">
            {about.stats.map((stat) => (
              <div key={stat.label} className="surface-card px-4 py-5 sm:px-5">
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                  {stat.label}
                </dt>
                <dd className="font-display mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </MotionSection>
  );
}
