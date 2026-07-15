import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { NumberGrid } from "@/components/marketplace/number-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { VipNumberWithRelations } from "@/types/database";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const supabase = await createClient();
  const { userId } = await getCurrentUser();

  const { data } = await supabase
    .from("wishlist")
    .select(
      `number:numbers(
        *,
        partner:partners(id, business_name, verification_status, rating, review_count, logo_url),
        category:categories(id, name, slug)
      )`,
    )
    .eq("customer_id", userId!)
    .order("created_at", { ascending: false });

  const numbers = ((data ?? []) as unknown as {
    number: VipNumberWithRelations | null;
  }[])
    .map((r) => r.number)
    .filter(Boolean) as VipNumberWithRelations[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      {numbers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Heart className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Your wishlist is empty.</p>
            <Button asChild variant="gradient">
              <Link href="/search">Discover VIP Numbers</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <NumberGrid numbers={numbers} />
      )}
    </div>
  );
}
