import Link from "next/link";
import { Gem } from "lucide-react";
import { getHomeSections } from "@/lib/queries";
import { HeroSearch } from "@/components/marketplace/hero-search";
import { HeroStats } from "@/components/marketplace/hero-stats";
import { HeroFloatingCards } from "@/components/marketplace/hero-floating-cards";
import { Section } from "@/components/marketplace/number-grid";
import { CategoryPills } from "@/components/marketplace/category-pills";
import { BannerCarousel } from "@/components/marketplace/banner-carousel";
import { OfferRibbon } from "@/components/marketplace/offer-ribbon";
import { QuickCategoryCards } from "@/components/marketplace/quick-category-cards";
import { HowItWorks } from "@/components/marketplace/how-it-works";
import { DealerCta } from "@/components/marketplace/dealer-cta";
import { Testimonials } from "@/components/marketplace/testimonials";
import { TrustBadges } from "@/components/marketplace/trust-badges";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export default async function HomePage() {
  const { featured, trending, newest, business, lucky, categories, banners } =
    await getHomeSections();

  const hasAny =
    featured.length + trending.length + newest.length + business.length + lucky.length > 0;

  return (
    <>
      <OfferRibbon />

      {/* Hero */}
      <section className="vip-hero-bg relative overflow-hidden py-9 sm:py-14">
        <div className="container grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0a83c]/50 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-[#f0c988]">
              🚀 LIMITED TIME ONLY
            </span>
            <h1 className="vip-heading-gradient font-display mt-5 text-4xl font-black leading-[1.08] sm:text-5xl">
              Apna Number,
              <br />
              Apni Shaan.
            </h1>
            <p className="mt-4 max-w-lg text-base font-medium text-white/70">
              India ka sabse bharosemand VIP number bazaar — fancy, lucky aur premium Jio numbers,
              verified dealers se, seedha aapke ghar.
            </p>

            <div className="mt-6">
              <HeroSearch />
            </div>

            <HeroStats />
          </div>

          <HeroFloatingCards numbers={featured.length ? featured : newest} />
        </div>
      </section>

      <BannerCarousel banners={banners} />

      <QuickCategoryCards />

      <CategoryPills categories={categories} />

      <Section
        title="🔥 Newly Added"
        subtitle="Fresh listings from our verified partners"
        href="/search?sort=newest"
        numbers={newest}
      />
      <Section
        title="Featured Numbers"
        subtitle="Hand-picked premium numbers"
        href="/search?sort=trending"
        numbers={featured}
      />
      <Section
        title="Trending Now"
        subtitle="Most viewed this week"
        href="/search?sort=trending"
        numbers={trending}
      />
      <Section
        title="Business Numbers"
        subtitle="Perfect for your brand"
        href="/search?category=business"
        numbers={business}
      />
      <Section
        title="Lucky Numbers"
        subtitle="Numerology-friendly picks"
        href="/search?category=lucky"
        numbers={lucky}
      />

      {!hasAny && <EmptyStateIfNoInventory />}

      <HowItWorks />
      <DealerCta />
      <Testimonials />
      <TrustBadges />
    </>
  );
}

function EmptyStateIfNoInventory() {
  return (
    <section className="container py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-vipCardBorder bg-white p-10 text-center">
        <Gem className="mx-auto mb-3 h-8 w-8 text-amber-500" />
        <h3 className="text-xl font-semibold">Inventory coming soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Approved listings will appear here. If you&apos;re a dealer, be the
          first to list your VIP numbers.
        </p>
        <Button asChild variant="vipOrange" className="mt-5">
          <Link href="/register/partner">Become a Partner</Link>
        </Button>
      </div>
    </section>
  );
}
