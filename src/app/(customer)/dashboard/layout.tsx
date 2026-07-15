import { redirect } from "next/navigation";
import { Heart, LayoutDashboard, Package, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { NavItem } from "@/components/dashboard/dashboard-nav";

const items: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentUser();
  if (!profile) redirect("/login?next=/dashboard");

  return (
    <DashboardShell title="My Account" items={items} profile={profile}>
      {children}
    </DashboardShell>
  );
}
