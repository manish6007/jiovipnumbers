"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Landmark, Smartphone } from "lucide-react";
import { chooseWonOrderPaymentMethod } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const METHODS = [
  { key: "upi", label: "UPI", icon: Smartphone },
  { key: "bank", label: "Bank", icon: Landmark },
  { key: "cash", label: "Cash", icon: Banknote },
] as const;

/** Auction winners don't pick a payment method up front like Buy Now does. */
export function ChoosePaymentMethod({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [picking, setPicking] = useState(false);

  function choose(method: (typeof METHODS)[number]["key"]) {
    startTransition(async () => {
      const res = await chooseWonOrderPaymentMethod(orderId, method);
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      toast({ variant: "success", title: "Now upload your payment proof below" });
      router.refresh();
    });
  }

  if (!picking) {
    return (
      <Button size="sm" variant="gold" onClick={() => setPicking(true)}>
        Complete payment
      </Button>
    );
  }

  return (
    <div className="flex gap-1.5">
      {METHODS.map((m) => (
        <button
          key={m.key}
          type="button"
          disabled={pending}
          onClick={() => choose(m.key)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary",
          )}
        >
          <m.icon className="h-3.5 w-3.5" /> {m.label}
        </button>
      ))}
    </div>
  );
}
