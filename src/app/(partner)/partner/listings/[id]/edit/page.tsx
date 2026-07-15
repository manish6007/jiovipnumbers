import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPartner } from "@/lib/auth";
import { NumberForm } from "@/components/dashboard/number-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category, VipNumber, NumberImage } from "@/types/database";

export const metadata = { title: "Edit Listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const partner = await getCurrentPartner();

  const [numberRes, categoriesRes] = await Promise.all([
    supabase
      .from("numbers")
      .select("*, images:number_images(url, sort_order)")
      .eq("id", id)
      .eq("partner_id", partner!.id)
      .maybeSingle(),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  if (!numberRes.data) notFound();
  const number = numberRes.data as VipNumber & { images: NumberImage[] };
  const categories = (categoriesRes.data as Category[]) ?? [];
  const images = (number.images ?? []).map((i) => i.url);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Listing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <NumberForm categories={categories} existing={number} existingImages={images} />
        </CardContent>
      </Card>
    </div>
  );
}
