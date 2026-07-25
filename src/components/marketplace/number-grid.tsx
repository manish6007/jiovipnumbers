import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { VipNumberWithRelations } from "@/types/database";
import { NumberCard } from "./number-card";

export function NumberGrid({ numbers }: { numbers: VipNumberWithRelations[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {numbers.map((n) => (
        <NumberCard key={n.id} number={n} />
      ))}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  href,
  numbers,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  numbers: VipNumberWithRelations[];
}) {
  if (!numbers.length) return null;
  return (
    <section className="container py-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="font-poppins text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <NumberGrid numbers={numbers} />
    </section>
  );
}
