import type { Metadata } from "next";
import "@htracker/styles.css";

export const metadata: Metadata = {
  title: "Tracker",
  description: "Private habit tracker",
  robots: { index: false, follow: false },
  alternates: { canonical: "/htracker/" },
  openGraph: {
    url: "/htracker/",
    title: "Tracker",
    description: "Private habit tracker",
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
