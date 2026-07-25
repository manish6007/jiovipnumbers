import Link from "next/link";
import { LogoMark } from "./logo-mark";
import type { MarkVariant } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "crest",
  size = 36,
  showWordmark = true,
  showDotCom = false,
  wordmarkClassName,
}: {
  className?: string;
  variant?: MarkVariant;
  size?: number;
  showWordmark?: boolean;
  showDotCom?: boolean;
  /** Override the "Jio"/"Number" text color, e.g. for dark backgrounds. */
  wordmarkClassName?: string;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <LogoMark variant={variant} size={size} />
      {showWordmark && (
        <span className="font-sans text-lg font-bold tracking-tight">
          <span className={wordmarkClassName ?? "text-foreground"}>Jio</span>
          <span className="gold-text">VIP</span>
          <span className={wordmarkClassName ?? "text-foreground"}>Number</span>
          {showDotCom && (
            <span className="ml-0.5 text-xs font-semibold text-muted-foreground">
              .com
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
