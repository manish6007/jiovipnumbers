import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { getPlatformSettings } from "@/app/actions/bids";

export const metadata = { title: "Login" };

export default async function LoginPage() {
  const settings = await getPlatformSettings();

  return (
    <Suspense>
      <LoginForm
        phoneEnabled={settings.phone_otp_enabled}
        emailEnabled={settings.email_otp_enabled}
        googleEnabled={settings.google_oauth_enabled}
      />
    </Suspense>
  );
}
