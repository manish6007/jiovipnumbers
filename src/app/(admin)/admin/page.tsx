import Link from "next/link";
import {
  Users,
  Store,
  ListChecks,
  ShoppingBag,
  IndianRupee,
  Percent,
  Clock,
  AlertCircle,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

async function count(table: string, filters: Record<string, unknown> = {}) {
  const admin = createAdminClient();
  let q = admin.from(table).select("id", { count: "exact", head: true });
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const [
    partners,
    customers,
    numbers,
    orders,
    pendingKyc,
    pendingListings,
    pendingOrders,
    completedOrders,
  ] = await Promise.all([
    count("partners"),
    count("profiles", { role: "customer" }),
    count("numbers"),
    count("orders"),
    count("partners", { verification_status: "pending" }),
    count("numbers", { listing_status: "pending" }),
    count("orders", { status: "pending" }),
    admin
      .from("orders")
      .select("price, commission_amount")
      .eq("status", "completed"),
  ]);

  const completed = (completedOrders.data ?? []) as { price: number; commission_amount: number }[];
  const revenue = completed.reduce((s, o) => s + o.price, 0);
  const commission = completed.reduce((s, o) => s + o.commission_amount, 0);

  const actionItems = [
    { label: "Pending KYC", value: pendingKyc, href: "/admin/partners", icon: Store },
    { label: "Pending Listings", value: pendingListings, href: "/admin/listings", icon: ListChecks },
    { label: "Pending Orders", value: pendingOrders, href: "/admin/orders", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Marketplace at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Partners" value={partners} icon={Store} accent="blue" />
        <StatCard label="Total Customers" value={customers} icon={Users} accent="violet" />
        <StatCard label="Total Numbers" value={numbers} icon={ListChecks} accent="blue" />
        <StatCard label="Total Orders" value={orders} icon={ShoppingBag} accent="amber" />
        <StatCard label="Total Revenue" value={formatINR(revenue)} icon={IndianRupee} accent="green" />
        <StatCard label="Commission Earned" value={formatINR(commission)} icon={Percent} accent="rose" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" /> Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {actionItems.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                href={a.href}
                className="glass flex items-center justify-between rounded-xl p-4 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">{a.label}</span>
                </div>
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-sm font-bold text-primary-foreground">
                  {a.value}
                </span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
