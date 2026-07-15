import { Wallet, TrendingUp, Clock, Percent } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPartner } from "@/lib/auth";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR, formatMobile, timeAgo } from "@/lib/utils";

export const metadata = { title: "Earnings" };

interface Row {
  id: string;
  order_code: string;
  price: number;
  commission_amount: number;
  partner_earning: number;
  status: string;
  created_at: string;
  number: { mobile_number: string } | null;
}

export default async function EarningsPage() {
  const supabase = await createClient();
  const partner = (await getCurrentPartner())!;

  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_code, price, commission_amount, partner_earning, status, created_at, number:numbers(mobile_number)",
    )
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as unknown as Row[];
  const completed = orders.filter((o) => o.status === "completed");
  const pending = orders.filter((o) => o.status === "pending" || o.status === "confirmed");

  const totalEarned = completed.reduce((s, o) => s + o.partner_earning, 0);
  const commissionPaid = completed.reduce((s, o) => s + o.commission_amount, 0);
  const pendingValue = pending.reduce((s, o) => s + o.partner_earning, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Net Earned" value={formatINR(totalEarned)} icon={Wallet} accent="green" />
        <StatCard label="Commission Paid" value={formatINR(commissionPaid)} icon={Percent} accent="rose" />
        <StatCard label="Pending Payout" value={formatINR(pendingValue)} icon={Clock} accent="amber" />
        <StatCard label="Completed Sales" value={completed.length} icon={TrendingUp} accent="blue" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Sale</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>You Earn</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No earnings yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.order_code}</TableCell>
                    <TableCell className="vip-number">
                      {o.number ? formatMobile(o.number.mobile_number) : "—"}
                    </TableCell>
                    <TableCell>{formatINR(o.price)}</TableCell>
                    <TableCell className="text-rose-600">-{formatINR(o.commission_amount)}</TableCell>
                    <TableCell className="font-semibold text-emerald-600">
                      {formatINR(o.partner_earning)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {timeAgo(o.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
