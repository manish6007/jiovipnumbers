import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-14">
      <h1 className="text-3xl font-bold">Terms &amp; Conditions</h1>
      <div className="prose mt-6 space-y-4 text-sm text-muted-foreground">
        <p>
          By using JioVIPNumber.com you agree to these terms. The platform is a
          marketplace connecting buyers and verified sellers of VIP mobile
          numbers. We facilitate discovery, booking and payment but the sale
          contract is between the buyer and the seller (partner).
        </p>
        <p>
          <strong className="text-foreground">Listings.</strong> Partners are
          responsible for the accuracy of their listings. All listings are
          reviewed before going live. Duplicate numbers are not permitted.
        </p>
        <p>
          <strong className="text-foreground">Commission.</strong> The platform
          charges a commission on each successful sale, deducted from the sale
          price. The applicable rate is snapshotted at the time of order.
        </p>
        <p>
          <strong className="text-foreground">Payments.</strong> Payments may be
          made online (Razorpay) or via manual methods (UPI, bank transfer,
          cash) with proof uploaded for verification. Number porting is subject
          to your telecom operator&apos;s process and timelines.
        </p>
        <p>
          <strong className="text-foreground">Prohibited use.</strong> You may
          not use the platform for fraudulent, unlawful or abusive activity.
          Accounts may be suspended for violations.
        </p>
        <p>This is a template. Please have it reviewed by legal counsel before launch.</p>
      </div>
    </div>
  );
}
