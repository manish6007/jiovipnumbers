import Link from "next/link";
import { Heart, Package, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, formatMobile, timeAgo } from "@/lib/utils";

export const metadata = { title: "My Dashboard" };

export default async function CustomerDashboard() {
  const supabase = await createClient();
  const { userId, profile } = await getCurrentUser();

  const [ordersRes, wishlistRes, recentRes] = await Promise.all([
    supabase.from("orders").select("id, status", { count: "exact" }).eq("customer_id", userId!),
    supabase.from("wishlist").select("id", { count: "exact", head: true }).eq("customer_id", userId!),
    supabase
      .from("orders")
      .select("id, order_code, price, status, created_at, number:numbers(mobile_number)")
      .eq("customer_id", userId!)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const orders = (ordersRes.data ?? []) as { status: string }[];
  const active = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const recent = (recentRes.data ?? []) as unknown as {
    id: string;
    order_code: string;
    price: number;
    status: string;
    created_at: string;
    number: { mobile_number: string } | null;
  }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hi, {profile?.full_name || "there"} 👋</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s your account overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Orders" value={ordersRes.count ?? 0} icon={Package} accent="blue" />
        <StatCard label="Active Bookings" value={active} icon={Sparkles} accent="amber" />
        <StatCard label="Wishlist" value={wishlistRes.count ?? 0} icon={Heart} accent="rose" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No orders yet.{" "}
              <Link href="/search" className="text-primary hover:underline">
                Browse VIP numbers
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="vip-number font-semibold">
                      {o.number ? formatMobile(o.number.mobile_number) : o.order_code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.order_code} · {timeAgo(o.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatINR(o.price)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
