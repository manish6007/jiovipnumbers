import { createAdminClient } from "@/lib/supabase/admin";
import { CommissionForm } from "@/components/dashboard/commission-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_COMMISSION } from "@/lib/commission";
import type { CommissionSetting } from "@/types/database";

export const metadata = { title: "Commission Settings" };

export default async function AdminCommissionPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("commission_settings")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();
  const current = (data as CommissionSetting) ?? DEFAULT_COMMISSION;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commission Settings</h1>
        <p className="text-sm text-muted-foreground">
          Applies to every new order. Existing orders keep their snapshotted split.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Global Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <CommissionForm current={{ type: current.type, value: Number(current.value) }} />
        </CardContent>
      </Card>
    </div>
  );
}
