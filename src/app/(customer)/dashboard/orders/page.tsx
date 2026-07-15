import Link from "next/link";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PaymentProofUploader } from "@/components/dashboard/payment-proof-uploader";
import { WhatsAppButton } from "@/components/marketplace/whatsapp-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, formatMobile, timeAgo } from "@/lib/utils";

export const metadata = { title: "My Orders" };

interface OrderRow {
  id: string;
  order_code: string;
  price: number;
  status: string;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
  number: { mobile_number: string; slug: string } | null;
}

export default async function CustomerOrdersPage() {
  const supabase = await createClient();
  const { userId } = await getCurrentUser();

  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_code, price, status, payment_method, payment_status, created_at, number:numbers(mobile_number, slug)",
    )
    .eq("customer_id", userId!)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as unknown as OrderRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">You have no orders yet.</p>
            <Button asChild variant="gradient">
              <Link href="/search">Browse VIP Numbers</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="vip-number text-lg font-bold">
                      {o.number ? formatMobile(o.number.mobile_number) : "—"}
                    </p>
                    <StatusBadge status={o.status} />
                    <StatusBadge status={o.payment_status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Order {o.order_code} · {timeAgo(o.created_at)} ·{" "}
                    <span className="capitalize">{o.payment_method || "—"}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-extrabold gradient-text">
                    {formatINR(o.price)}
                  </span>
                  {o.number && (
                    <WhatsAppButton vipNumber={o.number.mobile_number} size="sm" label="Seller" />
                  )}
                  {o.payment_status !== "paid" &&
                    o.payment_method &&
                    o.payment_method !== "razorpay" && (
                      <PaymentProofUploader orderId={o.id} />
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
