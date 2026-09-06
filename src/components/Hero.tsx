"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { site, social } from "@/data/portfolio";

export function Hero() {
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const animate = hydrated && !reduceMotion;

  const container = {
    hidden: { opacity: animate ? 0 : 1 },
    visible: {
      opacity: 1,
      transition: animate
        ? { staggerChildren: 0.09, delayChildren: 0.05 }
        : { duration: 0 },
    },
  };

  const item = {
    hidden: { opacity: animate ? 0 : 1, y: animate ? 16 : 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: animate
        ? { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
        : { duration: 0 },
    },
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-[var(--border)] pb-24 pt-32 sm:pb-32 sm:pt-40"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundImage: "var(--hero-wash)" }}
        aria-hidden
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial={hydrated ? "hidden" : false}
          animate="visible"
          className="max-w-3xl"
        >
          <motion.p
            variants={item}
            className="text-sm font-medium tracking-wide text-[var(--accent)]"
          >
            {site.role}
          </motion.p>

          <motion.h1
            variants={item}
            className="font-display mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl lg:leading-[1.05]"
          >
            Hi, I&apos;m {site.name}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl"
          >
            {site.headline}
          </motion.p>

          <motion.p
            variants={item}
            className="mt-3 text-sm font-medium text-[var(--muted)]"
          >
            {site.location} · {site.availability}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a href="#contact" className="btn-primary group">
              Get in touch
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#projects" className="btn-secondary">
              View work
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap gap-6 text-sm font-medium text-[var(--muted)]"
          >
            <a
              href={social.github}
              target="_blank"
              rel="me noopener"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              GitHub
            </a>
            <a
              href={social.linkedin}
              target="_blank"
              rel="me noopener"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              LinkedIn
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
