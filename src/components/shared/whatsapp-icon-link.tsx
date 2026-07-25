import { cn } from "@/lib/utils";

/**
 * Generic click-to-chat WhatsApp icon (header/footer contact point) — not
 * tied to a specific listing, unlike `WhatsAppButton`.
 */
export function WhatsAppIconLink({ className }: { className?: string }) {
  const to = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const text = encodeURIComponent("Hello, I'm interested in VIP numbers. Please share details.");
  const href = `https://wa.me/${to}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "flex h-9 w-9 flex-none items-center justify-center rounded-full bg-vipWhatsapp text-white transition-opacity hover:opacity-90",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.464 3.485 1.345 5.003l-1.43 5.22 5.345-1.403a9.96 9.96 0 0 0 4.737 1.207h.004c5.514 0 9.997-4.483 9.997-9.998 0-2.671-1.04-5.182-2.929-7.071a9.935 9.935 0 0 0-7.072-2.955zm5.868 15.867a8.26 8.26 0 0 1-4.868 1.573h-.003a8.279 8.279 0 0 1-4.221-1.156l-.303-.18-3.171.832.847-3.093-.198-.317a8.264 8.264 0 0 1-1.267-4.412c0-4.583 3.729-8.312 8.315-8.312a8.26 8.26 0 0 1 5.879 2.438 8.259 8.259 0 0 1 2.432 5.881c0 4.583-3.73 8.312-8.317 8.312z" />
      </svg>
    </a>
  );
}
