/**
 * Brand marks for JioVIPNumber.com — gold + blue identity.
 *
 * 100% original SVG geometry — a semi-flat interpretation of the team's gold/blue
 * direction. It deliberately does NOT reproduce Reliance Jio's logo, wordmark, or
 * brand colorway. One source of truth so the header, favicon, apple-icon and OG
 * image never drift.
 *
 *   - "crest"  → crowned "V" + diamond gem on a navy/gold tile (PRIMARY: header,
 *                favicon, app-icon — reads down to 16px)
 *   - "emblem" → full horizontal crest (SIM chip · crowned VIP · diamond) for hero
 *   - "chip" / "crown" → earlier flat marks, kept for reference / fallback
 */

export type MarkVariant = "crest" | "chip" | "crown";

export const BRAND = {
  name: "JioVIPNumber.com",
  tagline: "Choose your VIP identity",
  blueFrom: "#2563eb",
  blueTo: "#0ea5e9",
  goldLight: "#fde68a",
  goldMid: "#f59e0b",
  goldDeep: "#b45309",
  gold: "#eab308",
  navy: "#0b1e46",
  navy2: "#0a1a3c",
} as const;

/** Shared <defs> gradients (gold metallic, blue, diamond) keyed by a unique id. */
function defs(id: string): string {
  return `<defs>
    <linearGradient id="${id}-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff2c4"/>
      <stop offset="0.35" stop-color="#fcd34d"/>
      <stop offset="0.7" stop-color="#f59e0b"/>
      <stop offset="1" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="${id}-blue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b82f6"/>
      <stop offset="1" stop-color="#0ea5e9"/>
    </linearGradient>
    <linearGradient id="${id}-navy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12306e"/>
      <stop offset="1" stop-color="#0a1a3c"/>
    </linearGradient>
    <linearGradient id="${id}-gem" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bae6fd"/>
      <stop offset="1" stop-color="#0284c7"/>
    </linearGradient>
  </defs>`;
}

/** A small crown (3 peaks + gem dots) centered at cx, sitting on baseline y. */
function crown(cx: number, y: number, w: number, gold: string): string {
  const h = w * 0.62;
  const l = cx - w / 2;
  const r = cx + w / 2;
  const midY = y - h;
  return `
    <path d="M${l} ${y} L${l} ${midY + h * 0.35} L${cx - w * 0.18} ${midY + h * 0.62} L${cx} ${midY} L${cx + w * 0.18} ${midY + h * 0.62} L${r} ${midY + h * 0.35} L${r} ${y} Z"
          fill="${gold}" stroke="#7c4a0a" stroke-width="0.5" stroke-linejoin="round"/>
    <circle cx="${l}" cy="${midY + h * 0.35}" r="${w * 0.09}" fill="#fff7d6"/>
    <circle cx="${cx}" cy="${midY}" r="${w * 0.1}" fill="#fff7d6"/>
    <circle cx="${r}" cy="${midY + h * 0.35}" r="${w * 0.09}" fill="#fff7d6"/>`;
}

/** Faceted blue diamond centered at cx,cy with half-width r. */
function diamond(cx: number, cy: number, r: number, gemFill: string): string {
  const top = cy - r * 0.75;
  const belt = cy - r * 0.25;
  const bot = cy + r * 1.05;
  return `
    <g stroke="#e0f2fe" stroke-width="0.5" stroke-linejoin="round">
      <path d="M${cx - r} ${belt} L${cx - r * 0.5} ${top} L${cx + r * 0.5} ${top} L${cx + r} ${belt} L${cx} ${bot} Z" fill="${gemFill}"/>
      <path d="M${cx - r} ${belt} L${cx + r} ${belt}" />
      <path d="M${cx - r * 0.5} ${top} L${cx} ${belt} L${cx + r * 0.5} ${top}" fill="#7dd3fc"/>
      <path d="M${cx - r} ${belt} L${cx} ${belt} L${cx} ${bot} Z" fill="#0369a1" opacity="0.35"/>
    </g>`;
}

/** Inner glyph for the compact tile marks (48×48 grid). */
function glyph(variant: MarkVariant, id: string): string {
  if (variant === "crest") {
    // Crowned bold "V" with a diamond gem in the valley.
    return `
      ${crown(24, 17.5, 15, `url(#${id}-gold)`)}
      <path d="M13.5 19 L24 36.5 L34.5 19 L29.6 19 L24 29 L18.4 19 Z"
            fill="url(#${id}-gold)" stroke="#7c4a0a" stroke-width="0.5" stroke-linejoin="round"/>
      ${diamond(24, 22.5, 2.6, `url(#${id}-gem)`)}`;
  }
  if (variant === "crown") {
    return `
      <path d="M11 30 L11 18.5 L16.5 23.5 L20.5 16 L24 21.5 L27.5 16 L31.5 23.5 L37 18.5 L37 30 Z"
            fill="url(#${id}-gold)" stroke="#7c4a0a" stroke-width="0.6" stroke-linejoin="round"/>
      <rect x="11" y="30" width="26" height="5" rx="1.6" fill="url(#${id}-gold)"/>
      <circle cx="24" cy="20.4" r="1.7" fill="#fff7d6"/>`;
  }
  // chip
  return `
    <rect x="12.5" y="16" width="19" height="18" rx="4.2" fill="none" stroke="url(#${id}-gold)" stroke-width="2.4"/>
    <path d="M22 17.6 V32.4 M14.2 25 H29.8" stroke="url(#${id}-gold)" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="22" cy="25" r="2.5" fill="url(#${id}-navy)" stroke="url(#${id}-gold)" stroke-width="1.6"/>`;
}

/**
 * Compact self-contained mark: navy tile + gold ring + glyph. `id` should be
 * unique per document for strict-valid markup; identical repeats render fine.
 */
export function markSvg(
  variant: MarkVariant = "crest",
  size = 48,
  id = `jv-${variant}`,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="JioVIPNumber">
  ${defs(id)}
  <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#${id}-navy)"/>
  <rect x="2.6" y="2.6" width="42.8" height="42.8" rx="11.6" fill="none" stroke="url(#${id}-gold)" stroke-width="2.2"/>
  ${glyph(variant, id)}
</svg>`;
}

/**
 * Full horizontal emblem for hero / OG: SIM chip · crowned "VIP" · diamond, on a
 * navy pill with a gold ring. viewBox 0 0 360 140.
 */
export function emblemSvg(width = 360, id = "jv-emblem"): string {
  const height = Math.round((width * 140) / 360);
  const gold = `url(#${id}-gold)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 360 140" role="img" aria-label="JioVIPNumber emblem">
  ${defs(id)}
  <rect x="4" y="18" width="352" height="104" rx="52" fill="url(#${id}-navy)"/>
  <rect x="9" y="23" width="342" height="94" rx="47" fill="none" stroke="${gold}" stroke-width="3"/>

  <!-- SIM chip -->
  <g transform="translate(40 44)">
    <rect x="0" y="0" width="54" height="52" rx="10" fill="none" stroke="${gold}" stroke-width="3.2"/>
    <rect x="10" y="12" width="34" height="28" rx="4" fill="none" stroke="${gold}" stroke-width="2.4"/>
    <path d="M27 12 V40 M10 26 H44" stroke="${gold}" stroke-width="2.4"/>
    <path d="M10 19 H18 M36 19 H44 M10 33 H18 M36 33 H44" stroke="${gold}" stroke-width="2"/>
  </g>

  <!-- Crown over the V -->
  ${crown(150, 40, 40, gold)}

  <!-- VIP -->
  <g fill="${gold}" stroke="#7c4a0a" stroke-width="1" stroke-linejoin="round">
    <path d="M120 48 L150 104 L152 104 L134 48 Z"/>
    <path d="M150 104 L180 48 L166 48 L150 92 Z"/>
    <rect x="188" y="48" width="13" height="56" rx="2"/>
    <path d="M214 48 L214 104 L227 104 L227 86 L240 86 C252 86 260 78 260 67 C260 56 252 48 240 48 Z M227 60 L239 60 C243 60 246 63 246 67 C246 71 243 74 239 74 L227 74 Z"/>
  </g>

  <!-- Diamond -->
  ${diamond(300, 62, 20, `url(#${id}-gem)`)}
</svg>`;
}
