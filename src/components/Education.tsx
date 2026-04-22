"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { SectionLabel } from "@/components/SectionLabel";
import { education } from "@/data/portfolio";

export function Education() {
  return (
    <MotionSection
      id="education"
      className="border-b border-[var(--border)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionLabel index="05" title="Education" />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {education.map((entry, i) => (
            <motion.article
              key={entry.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{
                delay: i * 0.06,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="flex h-full flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border-strong)] sm:p-6"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--elevated)] text-[var(--accent)]">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  {entry.id.toUpperCase()}
                </p>
                <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-[var(--foreground)]">
                  {entry.degree}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {entry.institution}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
