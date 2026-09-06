"use client";

import { motion } from "framer-motion";
import { useHydrated } from "@/hooks/useHydrated";
import { MotionSection } from "@/components/MotionSection";
import { SectionHeading } from "@/components/SectionLabel";
import { experience } from "@/data/portfolio";

export function ExperienceTimeline() {
  const hydrated = useHydrated();

  return (
    <MotionSection
      id="experience"
      className="border-b border-[var(--border)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Experience"
          title="Where I've built"
          subtitle="Product teams, real systems, measurable outcomes."
        />

        <ol className="mt-14 space-y-6">
          {experience.map((job, idx) => (
            <motion.li
              key={job.company}
              initial={hydrated ? { opacity: 0, y: 14 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                delay: hydrated ? idx * 0.05 : 0,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="surface-card p-6 sm:p-8"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold text-[var(--foreground)]">
                    {job.company}
                  </h3>
                  {(job.role || job.location) && (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {[job.role, job.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <time className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                  {job.period}
                </time>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
                {job.highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                      aria-hidden
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ol>
      </div>
    </MotionSection>
  );
}
