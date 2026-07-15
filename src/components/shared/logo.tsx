import Link from "next/link";
import { LogoMark } from "./logo-mark";
import type { MarkVariant } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "chip",
  size = 36,
  showWordmark = true,
}: {
  className?: string;
  variant?: MarkVariant;
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <LogoMark variant={variant} size={size} />
      {showWordmark && (
        <span className="text-lg font-extrabold tracking-tight">
          <span className="gradient-text">JioVIP</span>
          <span className="text-foreground">Number</span>
        </span>
      )}
    </Link>
  );
}
