import Link from "next/link";
import { Search, Store } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const { profile } = await getCurrentUser();

  return (
    <header className="glass-nav sticky top-0 z-40 w-full">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/search" className="transition-colors hover:text-primary">
            Browse Numbers
          </Link>
          <Link href="/search?category=business" className="transition-colors hover:text-primary">
            Business
          </Link>
          <Link href="/search?category=lucky" className="transition-colors hover:text-primary">
            Lucky
          </Link>
          <Link href="/search?pattern=mirror" className="transition-colors hover:text-primary">
            Mirror
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/search" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {!profile || profile.role === "customer" ? (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/register/partner">
                <Store className="h-4 w-4" /> Sell with us
              </Link>
            </Button>
          ) : null}

          {profile ? (
            <UserMenu
              name={profile.full_name || "My account"}
              role={profile.role}
              avatarUrl={profile.avatar_url}
            />
          ) : (
            <Button asChild variant="gradient" size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
