"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** 6-box OTP entry with paste + auto-advance. */
export function OtpInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  function setAt(i: number, d: string) {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, length));
  }

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ""}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, d);
            if (d && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            onChange(pasted);
            refs.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
          className={cn(
            "h-12 w-full rounded-xl border border-input bg-white/70 text-center text-lg font-semibold shadow-sm backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        />
      ))}
    </div>
  );
}
