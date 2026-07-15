import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
  className,
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              dim,
              i <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200",
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        {rating > 0 ? rating.toFixed(1) : "New"}
        {reviewCount ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}
