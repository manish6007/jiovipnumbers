import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  vipNumber,
  to,
  price,
  className,
  size = "default",
  label = "WhatsApp",
}: {
  vipNumber: string;
  to?: string | null;
  price?: number;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  label?: string;
}) {
  const href = buildWhatsAppLink({ to, vipNumber, price });
  return (
    <Button
      asChild
      variant="whatsapp"
      size={size}
      className={cn(className)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" />
        {size !== "icon" && label}
      </a>
    </Button>
  );
}
