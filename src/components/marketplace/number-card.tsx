import Link from "next/link";
import { BadgeCheck, Eye, MapPin, Sparkles } from "lucide-react";
import type { VipNumberWithRelations } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "./whatsapp-button";
import { RatingStars } from "./rating-stars";
import { FlapDigits } from "./flap-digits";
import { cn, formatINR, formatMobile } from "@/lib/utils";

export function NumberCard({ number }: { number: VipNumberWithRelations }) {
  const partner = number.partner;
  const soldOut = number.status === "sold" || number.status === "reserved";

  return (
    <div
      className={cn(
        "group glass relative flex flex-col overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-glass-lg",
        number.is_featured && "ring-2 ring-amber-400/60",
      )}
    >
      {/* badges */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {number.is_featured && (
            <Badge variant="premium">
              <Sparkles className="h-3 w-3" /> Premium
            </Badge>
          )}
          {number.is_trending && <Badge variant="info">Trending</Badge>}
          {number.is_mirror && <Badge variant="secondary">Mirror</Badge>}
          {number.category?.name && !number.is_featured && (
            <Badge variant="outline">{number.category.name}</Badge>
          )}
        </div>
        {soldOut ? (
          <Badge variant="destructive" className="capitalize">
            {number.status}
          </Badge>
        ) : (
          <Badge variant="success">Available</Badge>
        )}
      </div>

      {/* number */}
      <Link href={`/number/${number.slug}`} className="flex justify-center py-1">
        <FlapDigits value={number.mobile_number} size="sm" />
      </Link>

      <div className="mt-2 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        {number.circle && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {number.circle}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" /> {number.views}
        </span>
      </div>

      {/* price + seller */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="text-xl font-extrabold gradient-text">
            {formatINR(number.selling_price)}
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

      {/* actions */}
      <div className="mt-4 flex items-center gap-2">
        <Button asChild variant="default" size="sm" className="flex-1">
          <Link href={`/number/${number.slug}`}>View Details</Link>
        </Button>
        <WhatsAppButton
          vipNumber={number.mobile_number}
          price={number.selling_price}
          size="icon"
        />
      </div>
    </div>
  );
}
