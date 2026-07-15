import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-14">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <div className="prose mt-6 space-y-4 text-sm text-muted-foreground">
        <p>
          We respect your privacy. This policy explains what we collect and how
          we use it.
        </p>
        <p>
          <strong className="text-foreground">Data we collect.</strong> Mobile
          number (for OTP login), name, and — for partners — business and KYC
          details required to verify sellers and process payouts.
        </p>
        <p>
          <strong className="text-foreground">How we use it.</strong> To operate
          your account, process orders and commissions, prevent fraud, and
          communicate order updates. KYC and payment documents are stored
          privately and accessed only for verification.
        </p>
        <p>
          <strong className="text-foreground">Sharing.</strong> Buyer and seller
          contact details may be shared with each other to complete a
          transaction. We do not sell your data.
        </p>
        <p>
          <strong className="text-foreground">Your rights.</strong> You may
          request access to or deletion of your personal data by contacting
          support.
        </p>
        <p>This is a template. Please have it reviewed by legal counsel before launch.</p>
      </div>
    </div>
  );
}
