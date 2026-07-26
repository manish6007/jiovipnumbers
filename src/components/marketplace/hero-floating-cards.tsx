import type { CSSProperties } from "react";
import type { VipNumberWithRelations } from "@/types/database";
import { getRank, RANK_LABEL, RANK_BADGE_VARIANT } from "./number-card";
import { Badge } from "@/components/ui/badge";
import { FlapDigits } from "./flap-digits";
import { formatINR } from "@/lib/utils";

const POSITIONS = [
  { left: "0px", top: "0px", rot: "-4deg", delay: "0s" },
  { left: "150px", top: "80px", rot: "3deg", delay: "0.6s" },
  { left: "30px", top: "230px", rot: "-2deg", delay: "1.2s" },
];

/**
 * Decorative floating preview cards in the hero. Sourced from real inventory
 * (featured/newest) so they never show fake listings — when there's no
 * inventory yet, this renders nothing rather than making numbers up.
 */
export function HeroFloatingCards({ numbers }: { numbers: VipNumberWithRelations[] }) {
  const cards = numbers.slice(0, 3);
  if (!cards.length) return null;

  return (
    <div className="relative hidden h-[420px] min-w-[280px] lg:block">
      <div
        className="absolute -top-1.5 right-4 flex h-24 w-24 rotate-[8deg] flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#f7e3bb] to-[#d1791f] font-display text-2xl font-black text-[#3a2508] shadow-[0_10px_26px_rgba(209,121,31,0.5)]"
        style={{ animation: "vip-float-card 2.4s ease-in-out infinite" }}
      >
        <span>10%</span>
        <span className="text-[11px] font-extrabold">OFF</span>
      </div>
      {cards.map((n, i) => {
        const pos = POSITIONS[i] ?? POSITIONS[0];
        const rank = getRank(n);
        return (
          <div
            key={n.id}
            className="absolute w-[250px] rounded-2xl bg-white p-3.5 shadow-[0_18px_36px_rgba(0,0,0,0.4)]"
            style={
              {
                left: pos.left,
                top: pos.top,
                "--vip-rot": pos.rot,
                animation: `vip-float-card 5s ease-in-out infinite`,
                animationDelay: pos.delay,
                transform: `rotate(${pos.rot})`,
              } as CSSProperties
            }
          >
            <div className="mb-2 flex items-center justify-between">
              <Badge variant={RANK_BADGE_VARIANT[rank]} className="uppercase tracking-wide">
                {RANK_LABEL[rank]}
              </Badge>
              <span className="text-[10px] font-bold text-green-600">Available</span>
            </div>
            <div className="flex justify-center">
              <FlapDigits value={n.mobile_number} size="sm" flat />
            </div>
            <p className="mt-2 text-center font-display text-sm font-extrabold text-[#d1791f]">
              {formatINR(n.selling_price)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
