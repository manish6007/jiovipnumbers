"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = q.replace(/\D/g, "");
    router.push(digits ? `/search?q=${digits}` : "/search");
  }

  return (
    <form
      onSubmit={submit}
      className="glass-strong mx-auto flex w-full max-w-2xl items-center gap-2 rounded-2xl p-2"
    >
      <div className="flex flex-1 items-center gap-2 pl-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          inputMode="numeric"
          placeholder="Search VIP number e.g. 9243 111100"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" variant="gradient" size="lg">
        Search
      </Button>
    </form>
  );
}
