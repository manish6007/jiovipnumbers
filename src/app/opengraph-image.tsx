import { ImageResponse } from "next/og";
import { emblemSvg, BRAND } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "JioVIPNumber.com — Buy Premium VIP Mobile Numbers";

// Social share card — built from flexbox blocks + the shared emblem so it matches
// the site identity exactly (gold + blue).
export default function OpengraphImage() {
  const emblem = `data:image/svg+xml;utf8,${encodeURIComponent(emblemSvg(560))}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "64px 72px",
          backgroundColor: "#0a1a3c",
          backgroundImage:
            "linear-gradient(135deg, #0b1e46 0%, #0a1a3c 55%, #071531 100%)",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width={560} height={218} src={emblem} alt="" />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: "#60a5fa" }}>Jio</span>
            <span style={{ color: "#f59e0b" }}>VIP</span>
            <span style={{ color: "#e8eefc" }}>Number</span>
            <span style={{ color: "#93a3c4", fontSize: 30, marginLeft: 4, marginTop: 22 }}>.com</span>
          </div>
          <div style={{ fontSize: 30, color: "#cbd5e1", letterSpacing: 1 }}>
            {`${BRAND.tagline} · Verified sellers · Secure booking`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["92431 11100", "70007 00007", "99999 43210"].map((n) => (
            <div
              key={n}
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#fcd34d",
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.4)",
                borderRadius: 14,
                padding: "12px 24px",
              }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
