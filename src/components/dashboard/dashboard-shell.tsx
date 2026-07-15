import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/shared/user-menu";
import { DashboardNav, type NavItem } from "./dashboard-nav";
import type { Profile } from "@/types/database";

export function DashboardShell({
  title,
  items,
  profile,
  children,
}: {
  title: string;
  items: NavItem[];
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass-nav sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground sm:inline">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm text-muted-foreground hover:text-primary sm:inline">
              View site
            </Link>
            <UserMenu
              name={profile.full_name || "Account"}
              role={profile.role}
              avatarUrl={profile.avatar_url}
            />
          </div>
        </div>
      </header>

      <div className="container flex-1 py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass rounded-2xl p-3">
              <DashboardNav items={items} />
            </div>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
