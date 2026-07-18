import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number in Indian Rupees (₹). */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Group a 10-digit mobile number for display, e.g. 98765 43210. */
export function formatMobile(num: string): string {
  const clean = num.replace(/\D/g, "").slice(-10);
  if (clean.length !== 10) return num;
  return `${clean.slice(0, 5)} ${clean.slice(5)}`;
}

/** Relative time string, e.g. "3 days ago". */
export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

/** Relative time until a future date, e.g. "ends in 2 days". Past dates return "ended". */
export function timeUntil(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((d.getTime() - Date.now()) / 1000);
  if (seconds <= 0) return "ended";
  const intervals: [number, string][] = [
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `ends in ${count} ${label}${count > 1 ? "s" : ""}`;
  }
  return "ends in under a minute";
}

/** Deterministic slug for a listing: the digits themselves are unique + SEO-friendly. */
export function numberSlug(mobile: string): string {
  return mobile.replace(/\D/g, "").slice(-10);
}
