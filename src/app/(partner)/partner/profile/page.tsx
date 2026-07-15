import { BadgeCheck, Building2 } from "lucide-react";
import { getCurrentUser, getCurrentPartner } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Partner Profile" };

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

export default async function PartnerProfilePage() {
  const { profile } = await getCurrentUser();
  const partner = await getCurrentPartner();
  if (!profile || !partner) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Partner Profile</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" /> Business & KYC
            </CardTitle>
            <StatusBadge status={partner.verification_status} />
          </CardHeader>
          <CardContent>
            <Row label="Business Name" value={partner.business_name} />
            <Row label="GST Number" value={partner.gst_number} />
            <Row label="PAN" value={partner.pan_number} />
            <Row label="Address" value={partner.address} />
            <Row label="UPI ID" value={partner.upi_id} />
            <Row label="Bank Account" value={partner.bank_account_number} />
            <Row label="IFSC" value={partner.bank_ifsc} />
            {partner.verification_status === "approved" && (
              <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-success/10 p-2.5 text-xs text-success">
                <BadgeCheck className="h-4 w-4" /> Verified partner
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
