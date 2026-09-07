import { JsonLd } from "@/components/JsonLd";
import { getSiteUrl, personJsonLd, websiteJsonLd } from "@/lib/seo";

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = getSiteUrl();

  return (
    <>
      <JsonLd data={personJsonLd(siteUrl)} />
      <JsonLd data={websiteJsonLd(siteUrl)} />
      {children}
    </>
  );
}
