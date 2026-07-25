import Link from "next/link";
import type { Category } from "@/types/database";
import { Sparkles } from "lucide-react";

export function CategoryPills({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section className="container py-6">
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/search?category=${c.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-vipCardBorder bg-white px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:border-[#d1791f] hover:text-[#d1791f]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
