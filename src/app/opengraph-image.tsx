import { ImageResponse } from "next/og";
import { site } from "@/data/portfolio";

export const dynamic = "force-static";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f6f8",
          padding: "72px 80px",
          color: "#0f1419",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#0a6b60",
          }}
        >
          {site.role}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              maxWidth: 820,
              fontSize: 28,
              lineHeight: 1.4,
              color: "#5a6472",
            }}
          >
            {site.headline}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#5a6472",
          }}
        >
          <span>
            {site.location} · {site.availability}
          </span>
          <span>Node.js · NestJS · Distributed systems</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
