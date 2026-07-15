import { markSvg, type MarkVariant } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The JioVIPNumber brand mark (gradient tile + glyph). Reused by the Logo
 * component and mirrored by the favicon / apple-icon / OG image via the same
 * `markSvg` source. Server-safe (no hooks) — renders the shared SVG inline.
 */
export function LogoMark({
  variant = "crest",
  size = 36,
  className,
}: {
  variant?: MarkVariant;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 rounded-xl shadow-gold", className)}
      style={{ width: size, height: size, lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: markSvg(variant, size) }}
    />
  );
}
