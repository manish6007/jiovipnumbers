import { ImageResponse } from "next/og";
import { markSvg, BRAND } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "JioVIPNumber.com — Buy Premium VIP Mobile Numbers";

// Social share card. Built from flexbox blocks + the shared mark so it matches
// the site identity exactly.
export default function OpengraphImage() {
  const mark = `data:image/svg+xml;utf8,${encodeURIComponent(markSvg("chip", 132))}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#f8fbff",
          backgroundImage: "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 55%, #f8fbff 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width={112} height={112} src={mark} alt="" />
          <div style={{ display: "flex", fontSize: 46, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: "#2563eb" }}>JioVIP</span>
            <span style={{ color: "#0f1e38" }}>Number</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              color: "#0f1e38",
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Find your perfect VIP mobile number
          </div>
          <div style={{ fontSize: 34, color: "#5b6b86" }}>
            {`${BRAND.tagline} · Verified sellers · Secure booking`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["92431 11100", "70007 00007", "99999 43210"].map((n) => (
            <div
              key={n}
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#1e49b8",
                background: "#e8f1fe",
                border: "1px solid #cfe0fb",
                borderRadius: 16,
                padding: "14px 26px",
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
