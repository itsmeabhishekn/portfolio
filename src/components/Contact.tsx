"use client";

import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { SectionLabel } from "@/components/SectionLabel";
import { contact } from "@/data/portfolio";

export function Contact() {
  return (
    <MotionSection id="contact" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionLabel index="06" title="Contact" />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Open to meaningful backend and platform work. If you are building
              something that needs careful systems thinking, send a signal.
            </p>

            <div className="mt-10 space-y-4">
              <a
                href={`mailto:${contact.email}`}
                className="group flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--elevated)] p-4 transition-colors hover:border-[var(--accent-dim)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--bg-deep)] text-[var(--accent)]">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                    Email
                  </p>
                  <p className="text-sm font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)]">
                    {contact.email}
                  </p>
                </div>
              </a>

              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="group flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--elevated)] p-4 transition-colors hover:border-[var(--accent-dim)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--bg-deep)] text-[var(--accent)]">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)]">
                    {contact.phone}
                  </p>
                </div>
              </a>
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="flex flex-col justify-between rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-deep)] p-6 font-mono text-[11px] leading-relaxed text-[var(--muted)]"
          >
            <pre className="overflow-x-auto text-[10px] sm:text-[11px]">
{`$ ping contact.endpoint
PING portfolio.local
64 bytes: ttl=56 time=12.4ms
64 bytes: ttl=56 time=11.9ms
--- ok: channel ready ---`}
            </pre>
            <p className="mt-6 border-t border-[var(--border)] pt-4 text-[var(--muted)]">
              Prefer email for async technical detail.
            </p>
          </motion.aside>
        </div>
      </div>
    </MotionSection>
  );
}
