/**
 * Commission engine. The split is ALWAYS computed on the server from the active
 * `commission_settings` row and snapshotted onto the order — client-supplied
 * amounts are never trusted.
 *
 * Model (per spec): the customer pays the partner's listed price; the platform
 * commission is deducted from that price and the partner receives the remainder.
 *
 *   Partner price ₹10,000 · commission 10% → customer pays ₹10,000,
 *   admin earns ₹1,000, partner receives ₹9,000.
 */

export type CommissionType = "percentage" | "fixed";

export interface CommissionSetting {
  type: CommissionType;
  value: number; // percent (0-100) when 'percentage', rupees when 'fixed'
}

export interface CommissionResult {
  customerPays: number;
  commissionAmount: number;
  partnerEarning: number;
}

export function calculateCommission(
  price: number,
  setting: CommissionSetting,
): CommissionResult {
  const safePrice = Math.max(0, Math.round(price));
  let commission =
    setting.type === "percentage"
      ? Math.round((safePrice * setting.value) / 100)
      : Math.round(setting.value);

  // Commission can never exceed the sale price.
  commission = Math.min(Math.max(0, commission), safePrice);

  return {
    customerPays: safePrice,
    commissionAmount: commission,
    partnerEarning: safePrice - commission,
  };
}

/** Fallback used only if no active commission row exists (0% — no deduction). */
export const DEFAULT_COMMISSION: CommissionSetting = { type: "percentage", value: 0 };
