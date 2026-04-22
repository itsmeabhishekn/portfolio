"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/data/portfolio";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass =
    "text-[13px] font-medium tracking-wide text-[var(--muted)] transition-colors hover:text-[var(--foreground)]";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#hero"
          className="group flex items-baseline gap-2 font-mono text-[13px] text-[var(--foreground)]"
        >
          <span className="text-[var(--accent-dim)] opacity-80 transition-opacity group-hover:opacity-100">
            ~
          </span>
          <span className="tracking-tight">abhishek.n</span>
          <span className="hidden text-[var(--muted)] sm:inline">/portfolio</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={linkClass}>
              {l.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--foreground)] md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-b border-[var(--border)] bg-[var(--surface)] md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  className="rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--elevated)] hover:text-[var(--foreground)]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
