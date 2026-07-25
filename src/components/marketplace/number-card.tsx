import Link from "next/link";
import { BadgeCheck, Eye, Gavel, MapPin } from "lucide-react";
import type { VipNumberWithRelations } from "@/types/database";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "./whatsapp-button";
import { RatingStars } from "./rating-stars";
import { FlapDigits } from "./flap-digits";
import { cn, formatINR, timeUntil } from "@/lib/utils";

export type Rank = "diamond" | "platinum" | "gold" | "new";

export const RANK_LABEL: Record<Rank, string> = {
  diamond: "Diamond",
  platinum: "Platinum",
  gold: "Gold",
  new: "New",
};

export const RANK_BADGE_VARIANT: Record<Rank, BadgeProps["variant"]> = {
  diamond: "diamond",
  platinum: "platinum",
  gold: "goldRank",
  new: "newRank",
};

/**
 * There's no `rank` column in the schema, so we derive a display tier from
 * fields that already exist. Easy to retune the thresholds later.
 */
export function getRank(number: VipNumberWithRelations): Rank {
  const ageMs = Date.now() - new Date(number.created_at).getTime();
  if (ageMs < 14 * 24 * 60 * 60 * 1000) return "new";
  if (number.is_featured) return "diamond";
  if (number.is_trending) return "gold";
  return "platinum";
}

export function NumberCard({ number }: { number: VipNumberWithRelations }) {
  const partner = number.partner;
  const soldOut = number.status === "sold" || number.status === "reserved";
  const isAuction = number.auction_status === "active";
  const rank = getRank(number);

  return (
    <div className="group flex flex-col rounded-2xl border border-vipCardBorder bg-white p-4 transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-2.5 flex items-center justify-between">
        <Badge variant={RANK_BADGE_VARIANT[rank]} className="uppercase tracking-wide">
          {RANK_LABEL[rank]}
        </Badge>
        {soldOut ? (
          <Badge variant="destructive" className="capitalize">
            {number.status}
          </Badge>
        ) : (
          <Badge variant="success">Available</Badge>
        )}
      </div>

      <Link href={`/number/${number.slug}`} className="mb-2 flex justify-center py-1">
        <FlapDigits value={number.mobile_number} size="sm" flat />
      </Link>

      <p className="mb-1.5 flex items-center justify-center gap-3 text-center text-xs text-muted-foreground">
        {number.circle && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {number.circle}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" /> {number.views}
        </span>
      </p>

      {isAuction && (
        <p className="mb-1.5 flex items-center justify-center gap-1 text-center text-xs font-bold text-[#7c3aed]">
          <Gavel className="h-3 w-3" /> {number.bid_count} bids
          {number.auction_ends_at ? ` · ${timeUntil(number.auction_ends_at)}` : ""}
        </p>
      )}

      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground">
            {isAuction ? "Current Bid" : "Price"}
          </p>
          <p
            className={cn(
              "font-poppins text-lg font-extrabold",
              isAuction ? "text-[#7c3aed]" : "text-[#d1791f]",
            )}
          >
            {formatINR(isAuction ? number.current_bid ?? number.starting_bid ?? 0 : number.selling_price)}
          </p>
        </div>
        {partner && (
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-xs font-medium">
              <span className="max-w-[110px] truncate">{partner.business_name}</span>
              {partner.verification_status === "approved" && (
                <BadgeCheck className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <RatingStars rating={partner.rating} className="justify-end" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="vipOrange" size="sm" className="flex-1">
          <Link href={`/number/${number.slug}`}>{isAuction ? "Place Bid →" : "View Details"}</Link>
        </Button>
        <WhatsAppButton
          vipNumber={number.mobile_number}
          price={number.selling_price}
          size="icon"
          className="rounded-xl"
        />
      </div>
    </div>
  );
}
