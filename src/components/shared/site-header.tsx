import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { WhatsAppIconLink } from "./whatsapp-icon-link";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Browse Numbers", href: "/search" },
  { label: "Business", href: "/search?category=business" },
  { label: "Lucky", href: "/search?category=lucky" },
  { label: "Mirror", href: "/search?pattern=mirror" },
];

export async function SiteHeader() {
  const { profile } = await getCurrentUser();
  const showBecomeDealer = !profile || profile.role === "customer";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-vipCardBorder bg-white/95 backdrop-blur-sm">
      <div className="container relative flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 text-sm font-semibold text-foreground/75 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-[#d1791f]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {showBecomeDealer && (
            <Button asChild variant="vipOrange" size="sm">
              <Link href="/register/partner">Become a Dealer</Link>
            </Button>
          )}
          <WhatsAppIconLink />

          {profile ? (
            <UserMenu
              name={profile.full_name || "My account"}
              role={profile.role}
              avatarUrl={profile.avatar_url}
            />
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login / Register</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {profile && (
            <UserMenu
              name={profile.full_name || "My account"}
              role={profile.role}
              avatarUrl={profile.avatar_url}
            />
          )}
          <MobileNav
            navItems={NAV_ITEMS}
            showLoginRegister={!profile}
            showBecomeDealer={showBecomeDealer}
          />
        </div>
      </div>
    </header>
  );
}
