"use client";

import { motion } from "framer-motion";
import { useHydrated } from "@/hooks/useHydrated";
import { MotionSection } from "@/components/MotionSection";
import { SectionHeading } from "@/components/SectionLabel";
import { skillGroups } from "@/data/portfolio";

export function Skills() {
  const hydrated = useHydrated();

  return (
    <MotionSection
      id="skills"
      className="border-b border-[var(--border)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Skills"
          title="Core stack"
          subtitle="The tools I deploy, optimize, or phase out."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {skillGroups.map((group, i) => (
            <motion.article
              key={group.title}
              initial={hydrated ? { opacity: 0, y: 14 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{
                delay: hydrated ? i * 0.04 : 0,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="surface-card p-5 sm:p-6"
            >
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                {group.title}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-[var(--elevated)] px-3 py-1.5 text-sm text-[var(--muted)]"
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
