"use client";

import { motion } from "framer-motion";
import { Layers, ArrowUpRight } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { SectionLabel } from "@/components/SectionLabel";
import { ProjectArchitecture } from "@/components/ProjectArchitecture";
import { contact, featuredProjects } from "@/data/portfolio";

const caseStudyHref = `mailto:${contact.email}?subject=${encodeURIComponent(
  "Case study: Delivery Management System",
)}`;

export function FeaturedProjects() {
  return (
    <MotionSection
      id="projects"
      className="border-b border-[var(--border)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionLabel index="04" title="Featured work" />

        <div className="mt-12 space-y-10">
          {featuredProjects.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                delay: i * 0.06,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="group grid gap-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--border-strong)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--elevated)] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                      <Layers className="h-3 w-3 text-[var(--accent)]" />
                      flagship
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      {project.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                      {project.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[var(--border)] bg-[var(--bg-deep)] px-3 py-1 text-[11px] font-medium text-[var(--foreground)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <ul className="mt-6 space-y-2 border-t border-[var(--border)] pt-6 font-mono text-[12px] text-[var(--muted)]">
                  {project.architecture.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-[var(--accent-dim)]">→</span>
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <a
                    href={caseStudyHref}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--foreground)]"
                  >
                    View Case Study
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>

              <ProjectArchitecture title={project.title} />
            </motion.article>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
