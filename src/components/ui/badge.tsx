import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
        destructive: "border-transparent bg-destructive/15 text-destructive",
        premium:
          "border-amber-300/60 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-sm",
        gold: "border-transparent bg-amber-500/15 text-amber-700",
        info: "border-transparent bg-blue-500/15 text-blue-600",
        // VIP homepage redesign — rank badges (literal hex, additive; see
        // NumberCard's getRank()). Kept separate from `gold`/`info` above
        // since those are used elsewhere with different meanings.
        diamond: "border-transparent bg-[#ede9fe] text-[#7c3aed]",
        platinum: "border-transparent bg-[#e5e7eb] text-[#475569]",
        goldRank: "border-transparent bg-[#fdecd2] text-[#a8722e]",
        newRank: "border-transparent bg-[#dbeafe] text-[#2563eb]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
