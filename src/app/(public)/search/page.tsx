import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { searchNumbers, type NumberSearchParams } from "@/lib/queries";
import { NumberGrid } from "@/components/marketplace/number-grid";
import { SearchFilters } from "@/components/marketplace/search-filters";
import { SortSelect, MobileFilters } from "@/components/marketplace/search-controls";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/database";

export const metadata: Metadata = {
  title: "Browse VIP Numbers",
  description:
    "Search premium VIP mobile numbers by pattern, price, state and circle.",
};

type SP = Record<string, string | string[] | undefined>;

function parseParams(sp: SP): NumberSearchParams {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const num = (k: string) => {
    const v = one(k);
    return v && !Number.isNaN(Number(v)) ? Number(v) : undefined;
  };
  return {
    q: one("q"),
    startsWith: one("startsWith"),
    endsWith: one("endsWith"),
    contains: one("contains"),
    pattern: one("pattern"),
    category: one("category"),
    state: one("state"),
    circle: one("circle"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    sort: (one("sort") as NumberSearchParams["sort"]) ?? "newest",
    page: num("page") ?? 1,
    pageSize: 24,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const params = parseParams(sp);
  const supabase = await createClient();

  const [{ data, count }, categoriesRes] = await Promise.all([
    searchNumbers(params),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);
  const categories = (categoriesRes.data as Category[]) ?? [];

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const buildPageHref = (p: number) => {
    const next = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (typeof v === "string" && k !== "page") next.set(k, v);
    });
    next.set("page", String(p));
    return `/search?${next.toString()}`;
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Browse VIP Numbers</h1>
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "number" : "numbers"} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MobileFilters categories={categories} />
          <SortSelect />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <SearchFilters categories={categories} />
        </aside>

        <div>
          {data.length === 0 ? (
            <div className="glass flex flex-col items-center rounded-2xl p-12 text-center">
              <SearchX className="mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No numbers found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try adjusting your filters or search for a different pattern.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/search">Reset filters</Link>
              </Button>
            </div>
          ) : (
            <>
              <NumberGrid numbers={data} />
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                  >
                    <Link href={buildPageHref(Math.max(1, page - 1))}>Previous</Link>
                  </Button>
                  <span className="px-3 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                  >
                    <Link href={buildPageHref(Math.min(totalPages, page + 1))}>Next</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
