import { ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPartner } from "@/lib/auth";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { OrderActions } from "@/components/dashboard/order-actions";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR, formatMobile, timeAgo } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

export const metadata = { title: "Partner Orders" };

interface Row {
  id: string;
  order_code: string;
  price: number;
  partner_earning: number;
  commission_amount: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
  number: { mobile_number: string } | null;
  customer: { full_name: string | null; phone: string | null } | null;
}

export default async function PartnerOrdersPage() {
  const supabase = await createClient();
  const partner = (await getCurrentPartner())!;

  const { data } = await supabase
    .from("orders")
    .select(
      `id, order_code, price, partner_earning, commission_amount, status, payment_method,
       payment_status, created_at,
       number:numbers(mobile_number),
       customer:profiles!orders_customer_id_fkey(full_name, phone)`,
    )
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="vip-number text-lg font-bold">
                      {o.number ? formatMobile(o.number.mobile_number) : "—"}
                    </p>
                    <StatusBadge status={o.status} />
                    <StatusBadge status={o.payment_status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {o.order_code} · {timeAgo(o.created_at)} ·{" "}
                    {o.customer?.full_name || "Customer"}{" "}
                    {o.customer?.phone ? `(${o.customer.phone})` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sale {formatINR(o.price)} · Commission {formatINR(o.commission_amount)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-extrabold gradient-text">
                    You earn {formatINR(o.partner_earning)}
                  </span>
                  <OrderActions
                    orderId={o.id}
                    status={o.status}
                    paymentStatus={o.payment_status}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
