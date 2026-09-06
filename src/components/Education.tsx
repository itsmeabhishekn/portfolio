"use client";

import { motion } from "framer-motion";
import { useHydrated } from "@/hooks/useHydrated";
import { MotionSection } from "@/components/MotionSection";
import { SectionHeading } from "@/components/SectionLabel";
import { education } from "@/data/portfolio";

export function Education() {
  const hydrated = useHydrated();

  return (
    <MotionSection
      id="education"
      className="border-b border-[var(--border)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Education"
          title="Learning path"
          subtitle="Formal grounding behind the systems work."
        />

        <ul className="mt-14 grid gap-4 md:grid-cols-3">
          {education.map((entry, i) => (
            <motion.li
              key={entry.id}
              initial={hydrated ? { opacity: 0, y: 12 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{
                delay: hydrated ? i * 0.04 : 0,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="surface-card p-5 sm:p-6"
            >
              <h3 className="font-display text-base font-semibold leading-snug text-[var(--foreground)]">
                {entry.degree}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {entry.institution}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </MotionSection>
  );
}
