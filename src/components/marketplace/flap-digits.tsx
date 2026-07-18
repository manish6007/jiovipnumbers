import { cn } from "@/lib/utils";

/**
 * The site's signature element: a phone number rendered as split-flap
 * departure-board tiles. VIP numbers are the product here, so the digits
 * themselves get the display treatment instead of sitting in plain text.
 */
export function FlapDigits({
  value,
  size = "md",
  className,
}: {
  value: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const chars = value.replace(/\s/g, "").split("");

  // Mobile-first widths are kept narrow enough that a full 10-digit number
  // never forces horizontal scroll on a ~360-390px phone viewport; `sm:`
  // restores the larger desktop sizing.
  const sizes = {
    sm: "h-6 w-4 text-xs sm:h-7 sm:w-5 sm:text-sm",
    md: "h-7 w-5 text-sm sm:h-10 sm:w-7 sm:text-lg",
    lg: "h-8 w-6 text-base sm:h-12 sm:w-9 sm:text-2xl",
    xl: "h-9 w-7 text-lg sm:h-16 sm:w-11 sm:text-4xl",
  }[size];

  return (
    <span className={cn("flap-row", className)}>
      {chars.map((ch, i) => (
        <span key={i} className={cn("flap-tile font-mono font-bold tabular-nums", sizes)}>
          {ch}
        </span>
      ))}
    </span>
  );
}
