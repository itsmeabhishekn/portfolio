"use client";

import { motion } from "framer-motion";
import { MotionSection } from "@/components/MotionSection";
import { SectionLabel } from "@/components/SectionLabel";
import { skillGroups } from "@/data/portfolio";

export function Skills() {
  return (
    <MotionSection
      id="skills"
      className="border-b border-[var(--border)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionLabel index="02" title="Skills" />
        <p className="mt-4 max-w-xl text-sm text-[var(--muted)]">
          Grouped by domain. Tools I reach for when shaping systems end to end.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {skillGroups.map((group, i) => (
            <motion.article
              key={group.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{
                delay: i * 0.05,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border-strong)]"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--glow-1)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60" />
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                {group.title}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-md border border-[var(--border)] bg-[var(--elevated)] px-2.5 py-1 text-[13px] text-[var(--foreground)] transition-colors hover:border-[var(--accent-dim)]"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
