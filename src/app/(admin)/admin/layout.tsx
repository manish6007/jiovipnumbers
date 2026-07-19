import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { NavItem } from "@/components/dashboard/dashboard-nav";

const items: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/admin/partners", label: "Partners", icon: "Store" },
  { href: "/admin/listings", label: "Listings", icon: "ListChecks" },
  { href: "/admin/orders", label: "Orders", icon: "ShoppingBag" },
  { href: "/admin/customers", label: "Customers", icon: "Users" },
  { href: "/admin/commission", label: "Commission", icon: "Percent" },
  { href: "/admin/coupons", label: "Coupons", icon: "Tag" },
  { href: "/admin/banners", label: "Banners", icon: "ImageIcon" },
  { href: "/admin/audit", label: "Audit Logs", icon: "ScrollText" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentUser();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin") redirect("/");

  return (
    <DashboardShell title="Admin" items={items} profile={profile}>
      {children}
    </DashboardShell>
  );
}
