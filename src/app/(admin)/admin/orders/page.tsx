import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { OrderActions } from "@/components/dashboard/order-actions";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatINR, formatMobile, timeAgo } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

export const metadata = { title: "Manage Orders" };

const TABS = ["pending", "confirmed", "completed", "cancelled", "all"] as const;

interface Row {
  id: string;
  order_code: string;
  price: number;
  commission_amount: number;
  partner_earning: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_status: string;
  payment_screenshot_url: string | null;
  created_at: string;
  number: { mobile_number: string; slug: string } | null;
  partner: { business_name: string } | null;
  customer: { full_name: string | null; phone: string | null } | null;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("orders")
    .select(
      `id, order_code, price, commission_amount, partner_earning, status, payment_method,
       payment_status, payment_screenshot_url, created_at,
       number:numbers(mobile_number, slug),
       partner:partners(business_name),
       customer:profiles!orders_customer_id_fkey(full_name, phone)`,
    )
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);
  const { data } = await query;
  const orders = (data ?? []) as unknown as Row[];

  // Sign private payment-screenshot paths for display.
  const signed = new Map<string, string>();
  await Promise.all(
    orders
      .filter((o) => o.payment_screenshot_url)
      .map(async (o) => {
        const { data } = await admin.storage
          .from("payment-screenshots")
          .createSignedUrl(o.payment_screenshot_url!, 300);
        if (data?.signedUrl) signed.set(o.id, data.signedUrl);
      }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/orders?status=${t}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              status === t ? "bg-primary text-primary-foreground" : "glass hover:text-primary",
            )}
          >
            {t}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-muted-foreground">No orders.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="vip-number text-lg font-bold">
                      {o.number ? formatMobile(o.number.mobile_number) : "—"}
                    </p>
                    <StatusBadge status={o.status} />
                    <StatusBadge status={o.payment_status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {o.order_code} · {timeAgo(o.created_at)} · {o.partner?.business_name || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Customer: {o.customer?.full_name || "—"} ({o.customer?.phone || "—"}) ·{" "}
                    <span className="capitalize">{o.payment_method || "—"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sale {formatINR(o.price)} · Commission {formatINR(o.commission_amount)} · Partner{" "}
                    {formatINR(o.partner_earning)}
                  </p>
                  {signed.get(o.id) && (
                    <a
                      href={signed.get(o.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View payment screenshot →
                    </a>
                  )}
                </div>
                <OrderActions
                  orderId={o.id}
                  status={o.status}
                  paymentStatus={o.payment_status}
                  isAdmin
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
