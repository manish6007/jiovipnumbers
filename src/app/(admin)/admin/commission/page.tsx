import { createAdminClient } from "@/lib/supabase/admin";
import { CommissionForm } from "@/components/dashboard/commission-form";
import { BiddingToggleForm } from "@/components/dashboard/bidding-toggle-form";
import { AuthMethodsForm } from "@/components/dashboard/auth-methods-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_COMMISSION } from "@/lib/commission";
import type { CommissionSetting, PlatformSettings } from "@/types/database";

export const metadata = { title: "Commission Settings" };

export default async function AdminCommissionPage() {
  const admin = createAdminClient();
  const [{ data }, { data: settingsData }] = await Promise.all([
    admin.from("commission_settings").select("*").eq("is_active", true).maybeSingle(),
    admin
      .from("platform_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle(),
  ]);
  const current = (data as CommissionSetting) ?? DEFAULT_COMMISSION;
  const settings = settingsData as PlatformSettings | null;
  const biddingEnabled = settings?.bidding_enabled ?? false;

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
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Bidding</CardTitle>
        </CardHeader>
        <CardContent>
          <BiddingToggleForm enabled={biddingEnabled} />
        </CardContent>
      </Card>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Login Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthMethodsForm
            phoneOtp={settings?.phone_otp_enabled ?? true}
            emailOtp={settings?.email_otp_enabled ?? false}
            googleOauth={settings?.google_oauth_enabled ?? false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
