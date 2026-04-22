"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, GitFork, Link2, Terminal } from "lucide-react";
import { social } from "@/data/portfolio";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section
      id="hero"
      className="relative border-b border-[var(--border)] pb-24 pt-28 sm:pb-28 sm:pt-32 lg:pt-36"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.div
            variants={item}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--elevated)] px-3 py-1.5 font-mono text-[11px] text-[var(--muted)]"
          >
            <Terminal className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
            <span className="select-none text-[var(--accent-dim)]">$</span>
            <span className="tracking-wide">
              run backend-engineer --env production
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
          >
            Abhishek N
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl"
          >
            <span className="text-[var(--foreground)]">
              Backend Engineer | Node.js | NestJS | Distributed Systems
            </span>
            <span className="mt-3 block text-base font-normal text-[var(--muted)] sm:text-[17px]">
              I build scalable backend systems, event-driven architectures, and
              high-performance web applications.
            </span>
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a
              href="#projects"
              className="group inline-flex h-11 items-center gap-2 rounded-md bg-[var(--foreground)] px-5 text-sm font-medium text-[var(--bg)] transition-transform hover:-translate-y-0.5"
            >
              View Projects
              <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            <a
              href="/resume.pdf"
              download
              className="inline-flex h-11 items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--elevated)]"
            >
              Download Resume
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-4 border-t border-[var(--border)] pt-8"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Connect
            </span>
            <div className="flex gap-2">
              <a
                href={social.github}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition-all hover:border-[var(--accent-dim)] hover:text-[var(--accent)]"
                aria-label="GitHub"
              >
                <GitFork className="h-4 w-4" />
              </a>
              <a
                href={social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition-all hover:border-[var(--accent-dim)] hover:text-[var(--accent)]"
                aria-label="LinkedIn"
              >
                <Link2 className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 hidden font-mono text-[10px] leading-relaxed text-[var(--muted)] opacity-40 lg:block">
        <pre className="text-right">
          {`┌───────────────┐
│ status: live  │
│ region: ap-s  │
└───────────────┘`}
        </pre>
      </div>
    </section>
  );
}
