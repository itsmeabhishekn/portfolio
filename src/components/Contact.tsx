import { Mail, Phone } from "lucide-react";
import { MotionSection } from "@/components/MotionSection";
import { contact, social } from "@/data/portfolio";

export function Contact() {
  return (
    <MotionSection id="contact" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] px-6 py-12 shadow-[var(--shadow-lg)] sm:px-10 sm:py-16 lg:px-14"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 70% at 100% 0%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 55%), linear-gradient(180deg, var(--surface), color-mix(in oklab, var(--elevated) 70%, var(--surface)))",
          }}
        >
          <p className="text-sm font-medium tracking-wide text-[var(--accent)]">
            Contact
          </p>
          <h2 className="font-display mt-3 max-w-xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
            Let&apos;s build something solid
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {contact.blurb}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <a href={`mailto:${contact.email}`} className="btn-primary">
              <Mail className="h-4 w-4" />
              {contact.email}
            </a>
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
            >
              <Phone className="h-4 w-4" />
              {contact.phone}
            </a>
          </div>

          <div className="mt-10 flex gap-5 border-t border-[var(--border)] pt-8 text-sm font-medium text-[var(--muted)]">
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
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
