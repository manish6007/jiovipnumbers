import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  hint?: string;
  accent?: "blue" | "green" | "amber" | "rose" | "violet";
}) {
  // A restrained, single-family palette (brass, sage, signal, crimson,
  // switchboard) instead of a rainbow of unrelated stock gradients.
  const accents: Record<string, string> = {
    blue: "from-[#8C6435] to-[#C9985C]",
    green: "from-[#3F6B4C] to-[#6B9478]",
    amber: "from-[#C0602C] to-[#DE9A66]",
    rose: "from-[#8C3B3B] to-[#B65C5C]",
    violet: "from-[#202A38] to-[#3A4B61]",
  };
  return (
    <Card className="flex items-center gap-4 p-5">
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-glow",
          accents[accent],
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-extrabold tracking-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}
