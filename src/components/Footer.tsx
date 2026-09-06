import { site, social } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <div className="flex gap-5">
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
    </footer>
  );
}
