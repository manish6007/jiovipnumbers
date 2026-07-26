import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DealerCta() {
  return (
    <section className="container py-10">
      <div className="vip-hero-bg grid grid-cols-1 items-center gap-8 rounded-3xl p-8 sm:p-10 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            Become a Dealer, Earn 10–15% Commission
          </p>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            List your VIP number inventory, reach thousands of buyers across India, and manage
            every sale from one simple dashboard.
          </p>
          <div className="mt-4 flex flex-wrap gap-5 text-sm font-semibold text-white/85">
            <span>✔ Easy Registration</span>
            <span>✔ High Earnings</span>
            <span>✔ Dedicated Support</span>
          </div>
          <Button asChild variant="vipOrange" size="lg" className="mt-5">
            <Link href="/register/partner">Register Now</Link>
          </Button>
        </div>
        <div className="hidden justify-self-center text-6xl sm:block">🤝</div>
      </div>
    </section>
  );
}
