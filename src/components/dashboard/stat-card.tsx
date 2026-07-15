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
  const accents: Record<string, string> = {
    blue: "from-blue-500 to-sky-400",
    green: "from-emerald-500 to-green-400",
    amber: "from-amber-500 to-yellow-400",
    rose: "from-rose-500 to-pink-400",
    violet: "from-violet-500 to-purple-400",
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
