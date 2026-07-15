import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Upload,
  ShoppingBag,
  Wallet,
  Clock,
  XCircle,
} from "lucide-react";
import { getCurrentUser, getCurrentPartner } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { NavItem } from "@/components/dashboard/dashboard-nav";

const items: NavItem[] = [
  { href: "/partner", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/partner/listings", label: "My Listings", icon: ListChecks },
  { href: "/partner/listings/new", label: "Add Number", icon: PlusCircle },
  { href: "/partner/bulk-upload", label: "Bulk Upload", icon: Upload },
  { href: "/partner/orders", label: "Orders", icon: ShoppingBag },
  { href: "/partner/earnings", label: "Earnings", icon: Wallet },
];

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentUser();
  if (!profile) redirect("/login?next=/partner");

  const partner = await getCurrentPartner();
  if (!partner) redirect("/register/partner");

  return (
    <DashboardShell title="Partner" items={items} profile={profile}>
      {partner.verification_status !== "approved" && (
        <div
          className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 text-sm ${
            partner.verification_status === "rejected"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-warning/30 bg-warning/10 text-warning"
          }`}
        >
          {partner.verification_status === "rejected" ? (
            <>
              <XCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Your KYC was rejected.</p>
                <p className="text-xs">
                  {partner.rejection_reason || "Please contact support to re-verify."}
                </p>
              </div>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Verification pending</p>
                <p className="text-xs">
                  You can prepare listings, but they go live only after an admin
                  approves your account.{" "}
                  <Link href="/partner/profile" className="underline">
                    Review KYC
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
