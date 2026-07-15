import Link from "next/link";
import { PlusCircle, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPartner } from "@/lib/auth";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ListingActions } from "@/components/dashboard/listing-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR, formatMobile } from "@/lib/utils";
import type { VipNumber } from "@/types/database";

export const metadata = { title: "My Listings" };

export default async function PartnerListingsPage() {
  const supabase = await createClient();
  const partner = (await getCurrentPartner())!;

  const { data } = await supabase
    .from("numbers")
    .select("*")
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });
  const numbers = (data as VipNumber[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button asChild variant="gradient">
          <Link href="/partner/listings/new">
            <PlusCircle className="h-4 w-4" /> Add Number
          </Link>
        </Button>
      </div>

      {numbers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <ListChecks className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No listings yet.</p>
            <Button asChild variant="gradient">
              <Link href="/partner/listings/new">Add your first number</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {numbers.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="vip-number font-semibold">
                      {formatMobile(n.mobile_number)}
                    </TableCell>
                    <TableCell className="font-semibold">{formatINR(n.selling_price)}</TableCell>
                    <TableCell>
                      <StatusBadge status={n.listing_status} />
                      {n.listing_status === "rejected" && n.rejection_reason && (
                        <p className="mt-1 max-w-[160px] text-xs text-destructive">
                          {n.rejection_reason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={n.status} />
                    </TableCell>
                    <TableCell>{n.views}</TableCell>
                    <TableCell className="text-right">
                      <ListingActions id={n.id} status={n.status} price={n.selling_price} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
