import { createAdminClient } from "@/lib/supabase/admin";
import { CouponManager } from "@/components/dashboard/coupon-manager";
import type { Coupon } from "@/types/database";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const admin = createAdminClient();
  const { data } = await admin.from("coupons").select("*").order("created_at", { ascending: false });
  const coupons = (data as Coupon[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          Promotion codes customers enter at checkout. The discount reduces the price
          before commission is split, so the platform and partner share the cost.
        </p>
      </div>
      <CouponManager coupons={coupons} />
    </div>
  );
}
