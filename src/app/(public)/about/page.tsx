import type { Metadata } from "next";
import { ShieldCheck, Store, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "JioVIPNumber.com is India's trusted multi-vendor marketplace for premium VIP mobile numbers.",
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-14">
      <h1 className="text-3xl font-bold sm:text-4xl">About JioVIPNumber.com</h1>
      <p className="mt-4 text-muted-foreground">
        JioVIPNumber.com is a multi-vendor marketplace that connects buyers of
        premium, fancy and VIP mobile numbers with verified sellers across
        India. Our mission is to make discovering and buying your perfect number
        simple, transparent and secure.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Store, title: "Verified Sellers", body: "Every partner is KYC-verified before listing." },
          { icon: ShieldCheck, title: "Secure Booking", body: "Protected checkout with admin oversight." },
          { icon: Users, title: "Wide Selection", body: "Thousands of numbers across every circle." },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="glass rounded-2xl p-5">
              <Icon className="mb-2 h-6 w-6 text-blue-500" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
