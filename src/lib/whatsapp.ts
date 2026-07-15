import { formatMobile } from "./utils";

/**
 * Build a wa.me deep link with a pre-filled enquiry message. No WhatsApp
 * Business API cost — a plain click-to-chat link works on web + mobile.
 */
export function buildWhatsAppLink(opts: {
  /** Destination number in international format without symbols, e.g. 919243111100. */
  to?: string | null;
  vipNumber: string;
  price?: number;
}): string {
  const to = (opts.to || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(
    /\D/g,
    "",
  );
  const lines = [
    "Hello,",
    `I am interested in VIP Number ${formatMobile(opts.vipNumber)}.`,
    "Please share complete details.",
  ];
  const text = encodeURIComponent(lines.join("\n"));
  const base = to ? `https://wa.me/${to}` : "https://wa.me/";
  return `${base}?text=${text}`;
}
