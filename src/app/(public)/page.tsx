import Link from "next/link";
import { ShieldCheck, Sparkles, Store, Zap } from "lucide-react";
import { getHomeSections } from "@/lib/queries";
import { HeroSearch } from "@/components/marketplace/hero-search";
import { Section } from "@/components/marketplace/number-grid";
import { CategoryPills } from "@/components/marketplace/category-pills";
import { BannerCarousel } from "@/components/marketplace/banner-carousel";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export default async function HomePage() {
  const { featured, trending, newest, business, lucky, categories, banners } =
    await getHomeSections();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-gradient" />
        <div className="container flex flex-col items-center py-16 text-center sm:py-24">
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-blue-500" />
            India&apos;s premium VIP number marketplace
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Find your <span className="gradient-text">perfect VIP number</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Search thousands of premium, fancy and lucky mobile numbers from
            verified sellers across India. Secure booking, instant WhatsApp
            enquiry.
          </p>

          <div className="mt-8 w-full">
            <HeroSearch />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-500" /> Verified sellers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-blue-500" /> Instant enquiry
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Store className="h-4 w-4 text-blue-500" /> Multi-vendor marketplace
            </span>
          </div>
        </div>
      </section>

      <BannerCarousel banners={banners} />

      <CategoryPills categories={categories} />

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
        title="Newly Added"
        subtitle="Fresh listings from our partners"
        href="/search?sort=newest"
        numbers={newest}
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

      <EmptyStateIfNoInventory
        hasAny={
          featured.length +
            trending.length +
            newest.length +
            business.length +
            lucky.length >
          0
        }
      />

      {/* Partner CTA */}
      <section className="container py-16">
        <div className="glass-strong flex flex-col items-center gap-4 rounded-3xl bg-hero-gradient p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Are you a VIP number dealer?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Join JioVIPNumber.com as a verified partner. List your inventory,
            reach thousands of buyers and manage sales from one dashboard.
          </p>
          <Button asChild variant="gradient" size="lg">
            <Link href="/register/partner">
              <Store className="h-5 w-5" /> Become a Partner
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function EmptyStateIfNoInventory({ hasAny }: { hasAny: boolean }) {
  if (hasAny) return null;
  return (
    <section className="container py-16">
      <div className="glass mx-auto max-w-xl rounded-2xl p-10 text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-blue-500" />
        <h3 className="text-xl font-semibold">Inventory coming soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Approved listings will appear here. If you&apos;re a dealer, be the
          first to list your VIP numbers.
        </p>
        <Button asChild variant="gradient" className="mt-5">
          <Link href="/register/partner">Become a Partner</Link>
        </Button>
      </div>
    </section>
  );
}
