import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  Eye,
  Gavel,
  Hash,
  MapPin,
  Signal,
  Sparkles,
  Store,
} from "lucide-react";
import { getNumberBySlug, getRelatedNumbers } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistIds } from "@/app/actions/wishlist";
import { maybeSettleAuction } from "@/app/actions/bids";
import { createAdminClient } from "@/lib/supabase/admin";
import { NumberGrid } from "@/components/marketplace/number-grid";
import { WhatsAppButton } from "@/components/marketplace/whatsapp-button";
import { WishlistButton } from "@/components/marketplace/wishlist-button";
import { BuyNowDialog } from "@/components/marketplace/buy-now-dialog";
import { BidDialog } from "@/components/marketplace/bid-dialog";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { FlapDigits } from "@/components/marketplace/flap-digits";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR, formatMobile, timeUntil } from "@/lib/utils";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const number = await getNumberBySlug(slug);
  if (!number) return { title: "Number not found" };
  const pretty = formatMobile(number.mobile_number);
  return {
    title: `VIP Number ${pretty} — ${formatINR(number.selling_price)}`,
    description:
      number.description ||
      `Buy premium VIP mobile number ${pretty} on JioVIPNumber.com. ${
        number.circle ? `Circle: ${number.circle}. ` : ""
      }Verified seller, secure booking.`,
    openGraph: {
      title: `VIP Number ${pretty}`,
      description: `Premium VIP number available for ${formatINR(number.selling_price)}.`,
      type: "website",
    },
    alternates: { canonical: `/number/${number.slug}` },
  };
}

export default async function NumberDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let number = await getNumberBySlug(slug);
  if (!number) notFound();

  // Lazy settlement: this codebase has no cron, so an auction whose deadline
  // has passed is closed out the next time its page is read, not exactly at
  // the deadline.
  if (
    number.auction_status === "active" &&
    number.auction_ends_at &&
    new Date(number.auction_ends_at) <= new Date()
  ) {
    await maybeSettleAuction(number.id);
    number = (await getNumberBySlug(slug)) ?? number;
  }

  // Fire-and-forget view increment (service role, doesn't block render).
  void createAdminClient()
    .from("numbers")
    .update({ views: number.views + 1 })
    .eq("id", number.id)
    .then(() => {});

  const [{ profile }, wishlistIds, related] = await Promise.all([
    getCurrentUser(),
    getWishlistIds(),
    getRelatedNumbers(number),
  ]);

  const isAuthed = !!profile;
  const soldOut = number.status === "sold" || number.status === "reserved";
  const isAuction = number.auction_status === "active";
  const displayPrice = isAuction
    ? number.current_bid ?? number.starting_bid ?? number.selling_price
    : number.selling_price;
  const partner = number.partner;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `VIP Number ${formatMobile(number.mobile_number)}`,
    description:
      number.description ||
      `Premium VIP mobile number ${formatMobile(number.mobile_number)}`,
    category: number.category?.name || "VIP Mobile Number",
    brand: { "@type": "Brand", name: number.operator },
    offers: {
      "@type": "Offer",
      price: displayPrice,
      priceCurrency: "INR",
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: partner?.business_name },
    },
  };

  return (
    <div className="container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/search" className="hover:text-primary">Numbers</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{formatMobile(number.mobile_number)}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-hero-gradient p-8 text-center">
              <div className="mb-3 flex flex-wrap justify-center gap-2">
                {number.is_featured && (
                  <Badge variant="premium">
                    <Sparkles className="h-3 w-3" /> Premium
                  </Badge>
                )}
                {number.is_trending && <Badge variant="info">Trending</Badge>}
                {number.is_mirror && <Badge variant="secondary">Mirror</Badge>}
                {number.has_repeated_digits && (
                  <Badge variant="secondary">Repeating</Badge>
                )}
                {isAuction && (
                  <Badge variant="info">
                    <Gavel className="h-3 w-3" /> Bidding
                  </Badge>
                )}
                <Badge variant={soldOut ? "destructive" : "success"} className="capitalize">
                  {soldOut ? number.status : "Available"}
                </Badge>
              </div>
              <div className="flex justify-center">
                <FlapDigits value={number.mobile_number} size="xl" />
              </div>
              <p className="mt-4 font-display text-3xl font-semibold text-accent">
                {formatINR(displayPrice)}
              </p>
              {isAuction && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {number.bid_count} bids · {number.auction_ends_at && timeUntil(number.auction_ends_at)}
                </p>
              )}
            </div>

            <CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
              <Spec icon={Signal} label="Operator" value={number.operator} />
              <Spec icon={MapPin} label="Circle" value={number.circle || "—"} />
              <Spec icon={Hash} label="Digit Sum" value={String(number.digit_sum)} />
              <Spec icon={Eye} label="Views" value={String(number.views)} />
            </CardContent>
          </Card>

          {number.description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {number.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: buy box + seller */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAuction ? `Current bid · ${number.bid_count} bids` : "Price"}
                </p>
                <p className="text-3xl font-extrabold gradient-text">
                  {formatINR(displayPrice)}
                </p>
                {isAuction && number.auction_ends_at && (
                  <p className="text-xs text-muted-foreground">{timeUntil(number.auction_ends_at)}</p>
                )}
              </div>

              <div className="flex gap-2">
                {isAuction ? (
                  <BidDialog
                    numberId={number.id}
                    mobileNumber={number.mobile_number}
                    currentBid={number.current_bid}
                    startingBid={number.starting_bid ?? number.selling_price}
                    isAuthed={isAuthed}
                    disabled={soldOut}
                  />
                ) : (
                  <BuyNowDialog
                    numberId={number.id}
                    mobileNumber={number.mobile_number}
                    price={number.selling_price}
                    isAuthed={isAuthed}
                    disabled={soldOut}
                  />
                )}
                <WishlistButton
                  numberId={number.id}
                  initialSaved={wishlistIds.has(number.id)}
                  isAuthed={isAuthed}
                />
              </div>

              <WhatsAppButton
                vipNumber={number.mobile_number}
                price={number.selling_price}
                className="w-full"
                label="Enquire on WhatsApp"
              />
            </div>
          </Card>

          {partner && (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Store className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-1 font-semibold">
                    {partner.business_name}
                    {partner.verification_status === "approved" && (
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <RatingStars rating={partner.rating} reviewCount={partner.review_count} />
                </div>
              </div>
              {partner.verification_status === "approved" && (
                <p className="mt-3 rounded-lg bg-secondary/60 p-2.5 text-xs text-muted-foreground">
                  <BadgeCheck className="mr-1 inline h-3.5 w-3.5 text-blue-500" />
                  Verified partner on JioVIPNumber.com
                </p>
              )}
            </Card>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-bold">Related Numbers</h2>
          <NumberGrid numbers={related} />
        </section>
      )}
    </div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-secondary/40 p-3 text-center">
      <Icon className="mb-1 h-4 w-4 text-blue-500" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
