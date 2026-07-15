import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentPartner } from "@/lib/auth";
import { PartnerRegisterForm } from "@/components/auth/partner-register-form";

export const metadata = { title: "Become a Partner" };

export default async function PartnerRegisterPage() {
  const { userId } = await getCurrentUser();

  // Already a partner? Send them to their dashboard.
  if (userId) {
    const partner = await getCurrentPartner();
    if (partner) redirect("/partner");
  }

  // If signed in but not a partner, skip straight to KYC.
  const initialStep = userId ? "kyc" : "phone";
  return <PartnerRegisterForm initialStep={initialStep} />;
}
