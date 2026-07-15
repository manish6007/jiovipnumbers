import { emblemSvg } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The full horizontal JioVIPNumber emblem (SIM chip · crowned VIP · diamond) for
 * hero / large contexts. Server-safe — renders the shared `emblemSvg` inline.
 */
export function LogoEmblem({
  width = 320,
  className,
}: {
  width?: number;
  className?: string;
}) {
  return (
    <span
      aria-label="JioVIPNumber"
      role="img"
      className={cn("inline-flex max-w-full shadow-gold", className)}
      style={{ lineHeight: 0, borderRadius: 52 }}
      dangerouslySetInnerHTML={{ __html: emblemSvg(width) }}
    />
  );
}
