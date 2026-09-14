import type { Metadata, Viewport } from "next";
import "@htracker/styles.css";

export const viewport: Viewport = {
  themeColor: "#f3eee4",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Habit Logs",
  description: "Private habit dashboard",
  robots: { index: false, follow: false },
  alternates: { canonical: "/htracker/" },
  openGraph: {
    url: "/htracker/",
    title: "Habit Logs",
    description: "Private habit dashboard",
  },
};

export default function HtrackerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="htracker-root">
      {children}
    </div>
  );
}
