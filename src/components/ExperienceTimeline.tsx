"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { SectionLabel } from "@/components/SectionLabel";
import { experience } from "@/data/portfolio";

export function ExperienceTimeline() {
  return (
    <MotionSection
      id="experience"
      className="border-b border-[var(--border)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionLabel index="03" title="Experience" />

        <div className="relative mt-14 max-w-3xl">
          <div
            className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--border)] sm:left-[19px]"
            aria-hidden
          />

          <ol className="space-y-12">
            {experience.map((job, idx) => (
              <motion.li
                key={job.company}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  delay: idx * 0.08,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                className="relative pl-12 sm:pl-14"
              >
                <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] sm:h-10 sm:w-10">
                  <Briefcase className="h-4 w-4" aria-hidden />
                </span>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border-strong)] sm:p-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      {job.company}
                    </h3>
                    <time className="font-mono text-[12px] text-[var(--muted)]">
                      {job.period}
                    </time>
                  </div>
                  <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-[var(--muted)]">
                    {job.highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)] opacity-70" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </MotionSection>
  );
}
