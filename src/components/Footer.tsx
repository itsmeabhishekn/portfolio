export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 font-mono text-[11px] text-[var(--muted)] sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Abhishek N. Crafted with intent.</p>
        <p className="opacity-70">UTC+5:30 · backend-first</p>
      </div>
    </footer>
  );
}
