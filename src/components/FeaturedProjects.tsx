"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { MotionSection } from "@/components/MotionSection";
import { SectionHeading } from "@/components/SectionLabel";
import { contact, featuredProjects } from "@/data/portfolio";

export function FeaturedProjects() {
  const hydrated = useHydrated();

  return (
    <MotionSection
      id="projects"
      className="border-b border-[var(--border)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Projects"
          title="Production builds"
          subtitle="Systems that made it past the whiteboard."
        />

        <div className="mt-14 grid gap-6">
          {featuredProjects.map((project, i) => {
            const href =
              project.href ??
              `mailto:${contact.email}?subject=${encodeURIComponent(
                `Case study: ${project.title}`,
              )}`;

            return (
              <motion.article
                key={project.id}
                initial={hydrated ? { opacity: 0, y: 16 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  delay: hydrated ? i * 0.05 : 0,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                className="surface-card group p-6 sm:p-8"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      {project.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
                      {project.summary}
                    </p>

                    <ul className="mt-5 space-y-2 text-sm text-[var(--muted)]">
                      {project.architecture.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.stack.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[var(--elevated)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={href}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
                  >
                    View case study
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
}
