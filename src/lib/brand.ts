/**
 * Brand marks for JioVIPNumber.com.
 *
 * 100% original SVG geometry — deliberately does NOT reproduce Reliance Jio's
 * logo, wordmark, or brand colorway. Two concepts share one source of truth so
 * the header component, favicon, apple-icon and OG image never drift apart:
 *
 *   - "chip"  → SIM-chip / number-tile mark with a premium spark (PRIMARY)
 *   - "crown" → geometric crown whose centre forms a "V" for VIP (ALTERNATE)
 */

export type MarkVariant = "chip" | "crown";

/** Inner glyph paths (white on the gradient tile), drawn in a 48×48 grid. */
function glyph(variant: MarkVariant, gradId: string): string {
  if (variant === "crown") {
    return `
      <path d="M11 30 L11 18.5 L16.5 23.5 L20.5 16 L24 21.5 L27.5 16 L31.5 23.5 L37 18.5 L37 30 Z"
            fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
      <rect x="11" y="30" width="26" height="5" rx="1.6" fill="#fff"/>
      <circle cx="24" cy="20.4" r="1.7" fill="url(#${gradId})"/>
      <circle cx="16.5" cy="32.5" r="1.5" fill="url(#${gradId})"/>
      <circle cx="31.5" cy="32.5" r="1.5" fill="url(#${gradId})"/>
    `;
  }
  // chip (primary)
  return `
    <rect x="12.5" y="16" width="19" height="18" rx="4.2"
          fill="none" stroke="#fff" stroke-width="2.4"/>
    <path d="M22 17.6 V32.4 M14.2 25 H29.8"
          stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="22" cy="25" r="2.5" fill="url(#${gradId})" stroke="#fff" stroke-width="1.8"/>
    <path d="M35 8.4 C35.5 11.6 36.4 12.5 39.6 13 C36.4 13.5 35.5 14.4 35 17.6
             C34.5 14.4 33.6 13.5 30.4 13 C33.6 12.5 34.5 11.6 35 8.4 Z"
          fill="#fff"/>
  `;
}

/**
 * A complete, self-contained SVG string for the mark (gradient tile + glyph).
 * `id` must be unique per document when you need strict-valid markup; the
 * default is fine for identical repeated instances (header + footer).
 */
export function markSvg(
  variant: MarkVariant = "chip",
  size = 48,
  id = `jv-${variant}`,
): string {
  const gradId = `${id}-g`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="JioVIPNumber">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2563eb"/>
      <stop offset="1" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>
  <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#${gradId})"/>
  <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="none" stroke="#fff" stroke-opacity="0.28"/>
  ${glyph(variant, gradId)}
</svg>`;
}

export const BRAND = {
  name: "JioVIPNumber.com",
  tagline: "Premium VIP Mobile Numbers",
  gradientFrom: "#2563eb",
  gradientTo: "#0ea5e9",
} as const;
