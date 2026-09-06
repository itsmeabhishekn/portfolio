import {
  about,
  contact,
  site,
  skillGroups,
  social,
} from "@/data/portfolio";

/** Canonical origin used for metadata, sitemap, robots, and JSON-LD. */
export function getSiteUrl(): string {
  const override = process.env.NEXT_PUBLIC_SITE_URL;
  if (override && /^https?:\/\//i.test(override)) {
    return override.replace(/\/$/, "");
  }

  return site.url;
}

export function isIndexable(): boolean {
  const context = process.env.CONTEXT;
  return context !== "deploy-preview" && context !== "branch-deploy";
}

export const seo = {
  title: `${site.name} — ${site.role} | Node.js, NestJS`,
  description:
    "Abhishek N is a backend engineer in India focused on Node.js, NestJS, Kafka, Redis, and reliable distributed systems. Open to backend roles and product work.",
  keywords: [
    "Abhishek N",
    "Abhishek Codes",
    "backend engineer",
    "Node.js developer",
    "NestJS",
    "distributed systems",
    "Kafka",
    "Redis",
    "India",
    "hire backend engineer",
  ],
};

export function personJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    givenName: "Abhishek",
    familyName: "N",
    url,
    image: `${url}/opengraph-image`,
    jobTitle: site.role,
    description: about.body,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    sameAs: [social.github, social.linkedin],
    knowsAbout: skillGroups.flatMap((group) => group.items),
  };
}

export function websiteJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${site.name} — ${site.role}`,
    url,
    description: seo.description,
    inLanguage: "en",
    publisher: {
      "@type": "Person",
      name: site.name,
    },
  };
}
