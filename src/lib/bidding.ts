/**
 * Bidding/auction helpers. Pure functions only — DB access lives in
 * src/app/actions/bids.ts.
 */

export const AUCTION_DURATION_HOURS = {
  "24h": 24,
  "3d": 72,
  "7d": 168,
} as const;

export type AuctionDurationKey = keyof typeof AUCTION_DURATION_HOURS;

/** Minimum next bid, given the current highest bid (or the starting bid if none yet). */
export function minNextBid(base: number): number {
  const increment = Math.max(500, Math.round(base * 0.02));
  return Math.round(base) + increment;
}

export function auctionEndsAt(durationHours: number, from = new Date()): string {
  return new Date(from.getTime() + durationHours * 60 * 60 * 1000).toISOString();
}
