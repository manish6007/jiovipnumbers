import Link from "next/link";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-glow">
        <Crown className="h-5 w-5" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        <span className="gradient-text">JioVIP</span>
        <span className="text-foreground">Number</span>
      </span>
    </Link>
  );
}
