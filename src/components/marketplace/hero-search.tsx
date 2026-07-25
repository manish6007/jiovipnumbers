"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_CHIPS = ["9999", "8888", "786", "0000", "1234", "VIP"];

export function HeroSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function go(value: string) {
    const digits = value.replace(/\D/g, "");
    router.push(digits ? `/search?q=${digits}` : "/search");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    go(q);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <form
        onSubmit={submit}
        className="flex w-full items-center gap-2 rounded-2xl bg-white p-2 shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
      >
        <div className="flex flex-1 items-center gap-2 pl-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            inputMode="numeric"
            placeholder="Search VIP number e.g. 9876 111100"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <Button type="submit" variant="vipOrange" size="lg">
          Search
        </Button>
      </form>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              setQ(chip);
              go(chip);
            }}
            className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/20"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
