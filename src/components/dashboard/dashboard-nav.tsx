"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  User,
  ListChecks,
  PlusCircle,
  Upload,
  ShoppingBag,
  Wallet,
  Users,
  Store,
  Percent,
  ImageIcon,
  ScrollText,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  LayoutDashboard,
  Package,
  Heart,
  User,
  ListChecks,
  PlusCircle,
  Upload,
  ShoppingBag,
  Wallet,
  Users,
  Store,
  Percent,
  ImageIcon,
  ScrollText,
  Tag,
} as const;

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  exact?: boolean;
}

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
