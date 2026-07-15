import { ImageResponse } from "next/og";
import { markSvg } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon: the mark centred on a clean white ground (iOS applies its
// own rounded mask). Uses the shared markSvg so it can never drift from the tab
// favicon.
export default function AppleIcon() {
  const mark = `data:image/svg+xml;utf8,${encodeURIComponent(markSvg("chip", 140))}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width={140} height={140} src={mark} alt="JioVIPNumber" />
      </div>
    ),
    { ...size },
  );
}
