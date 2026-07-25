"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIconLink } from "./whatsapp-icon-link";

export function MobileNav({
  navItems,
  showLoginRegister,
  showBecomeDealer,
}: {
  navItems: { label: string; href: string }[];
  showLoginRegister: boolean;
  showBecomeDealer: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 md:hidden">
      <WhatsAppIconLink />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-vipNavy-900 text-white"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full flex flex-col gap-0.5 border-t border-vipCardBorder bg-white px-4 py-3.5 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-vipCardBorder/60 py-2.5 text-sm font-semibold text-foreground/80"
            >
              {item.label}
            </Link>
          ))}
          {showLoginRegister && (
            <Button asChild variant="outline" size="sm" className="mt-2.5">
              <Link href="/login" onClick={() => setOpen(false)}>
                Login / Register
              </Link>
            </Button>
          )}
          {showBecomeDealer && (
            <Button asChild variant="vipOrange" size="sm" className="mt-2">
              <Link href="/register/partner" onClick={() => setOpen(false)}>
                Become a Dealer
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
