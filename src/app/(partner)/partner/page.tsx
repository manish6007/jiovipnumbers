import Link from "next/link";
import {
  ListChecks,
  ShoppingBag,
  Wallet,
  CheckCircle2,
  Clock,
  PlusCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPartner } from "@/lib/auth";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, formatMobile, timeAgo } from "@/lib/utils";

export const metadata = { title: "Partner Dashboard" };

export default async function PartnerDashboard() {
  const supabase = await createClient();
  const partner = (await getCurrentPartner())!;

  const [numbersRes, ordersRes, recentRes] = await Promise.all([
    supabase.from("numbers").select("id, status, listing_status").eq("partner_id", partner.id),
    supabase
      .from("orders")
      .select("id, status, partner_earning, commission_amount, payment_status")
      .eq("partner_id", partner.id),
    supabase
      .from("orders")
      .select("id, order_code, status, partner_earning, created_at, number:numbers(mobile_number)")
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const numbers = (numbersRes.data ?? []) as { status: string; listing_status: string }[];
  const orders = (ordersRes.data ?? []) as {
    status: string;
    partner_earning: number;
    commission_amount: number;
    payment_status: string;
  }[];

  const activeListings = numbers.filter(
    (n) => n.listing_status === "approved" && n.status === "available",
  ).length;
  const soldCount = numbers.filter((n) => n.status === "sold").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const earnings = orders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + o.partner_earning, 0);
  const commissionPaid = orders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + o.commission_amount, 0);

  const recent = (recentRes.data ?? []) as unknown as {
    id: string;
    order_code: string;
    status: string;
    partner_earning: number;
    created_at: string;
    number: { mobile_number: string } | null;
  }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{partner.business_name}</h1>
          <p className="text-sm text-muted-foreground">Partner dashboard overview</p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/partner/listings/new">
            <PlusCircle className="h-4 w-4" /> Add Number
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active Listings" value={activeListings} icon={ListChecks} accent="blue" />
        <StatCard label="Sold Numbers" value={soldCount} icon={CheckCircle2} accent="green" />
        <StatCard label="Pending Orders" value={pendingOrders} icon={Clock} accent="amber" />
        <StatCard label="Total Earnings" value={formatINR(earnings)} icon={Wallet} accent="violet" />
        <StatCard label="Commission Paid" value={formatINR(commissionPaid)} icon={ShoppingBag} accent="rose" />
        <StatCard label="Total Listings" value={numbers.length} icon={ListChecks} accent="blue" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/partner/orders">All orders</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet. Your approved listings will start receiving bookings.
            </p>
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
                    <span className="font-semibold">{formatINR(o.partner_earning)}</span>
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
