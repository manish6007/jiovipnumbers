"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "./search-filters";
import type { Category } from "@/types/database";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("sort") ?? "newest";

  const onChange = useCallback(
    (value: string) => {
      const next = new URLSearchParams(params.toString());
      next.set("sort", value);
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest first</SelectItem>
        <SelectItem value="trending">Most viewed</SelectItem>
        <SelectItem value="price_asc">Price: Low to High</SelectItem>
        <SelectItem value="price_desc">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function MobileFilters({ categories }: { categories: Category[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter numbers</DialogTitle>
        </DialogHeader>
        <SearchFilters categories={categories} />
      </DialogContent>
    </Dialog>
  );
}
