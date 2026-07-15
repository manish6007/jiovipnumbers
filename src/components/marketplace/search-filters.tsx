"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { STATES, CIRCLES, PATTERN_FILTERS } from "@/lib/constants";
import type { Category } from "@/types/database";

const ALL = "__all__";

export function SearchFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === ALL) next.delete(key);
      else next.set(key, value);
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const get = (k: string) => params.get(k) ?? "";
  const hasFilters = Array.from(params.keys()).some((k) => k !== "sort");

  return (
    <div className="glass sticky top-20 space-y-5 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* Pattern match inputs */}
      <div className="space-y-2">
        <Label>Starts With</Label>
        <Input
          inputMode="numeric"
          defaultValue={get("startsWith")}
          placeholder="e.g. 9243"
          onBlur={(e) => setParam("startsWith", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Ends With</Label>
        <Input
          inputMode="numeric"
          defaultValue={get("endsWith")}
          placeholder="e.g. 0000"
          onBlur={(e) => setParam("endsWith", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Contains</Label>
        <Input
          inputMode="numeric"
          defaultValue={get("contains")}
          placeholder="e.g. 786"
          onBlur={(e) => setParam("contains", e.target.value)}
        />
      </div>

      {/* Pattern category */}
      <div className="space-y-2">
        <Label>Pattern</Label>
        <Select
          value={get("pattern") || ALL}
          onValueChange={(v) => setParam("pattern", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any pattern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any pattern</SelectItem>
            {PATTERN_FILTERS.filter((p) =>
              ["repeated", "ascending", "descending", "mirror"].includes(p.key),
            ).map((p) => (
              <SelectItem key={p.key} value={p.key}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={get("category") || ALL}
          onValueChange={(v) => setParam("category", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <Label>Price Range (₹)</Label>
        <div className="flex items-center gap-2">
          <Input
            inputMode="numeric"
            placeholder="Min"
            defaultValue={get("minPrice")}
            onBlur={(e) => setParam("minPrice", e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            inputMode="numeric"
            placeholder="Max"
            defaultValue={get("maxPrice")}
            onBlur={(e) => setParam("maxPrice", e.target.value)}
          />
        </div>
      </div>

      {/* State */}
      <div className="space-y-2">
        <Label>State</Label>
        <Select value={get("state") || ALL} onValueChange={(v) => setParam("state", v)}>
          <SelectTrigger>
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All states</SelectItem>
            {STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Circle */}
      <div className="space-y-2">
        <Label>Circle</Label>
        <Select value={get("circle") || ALL} onValueChange={(v) => setParam("circle", v)}>
          <SelectTrigger>
            <SelectValue placeholder="All circles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All circles</SelectItem>
            {CIRCLES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
