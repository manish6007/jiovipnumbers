"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, PackageCheck } from "lucide-react";
import { advanceOrderStatus, verifyManualPayment } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { OrderStatus } from "@/types/database";

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  isAdmin = false,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const advance = (next: OrderStatus, label: string) =>
    startTransition(async () => {
      const res = await advanceOrderStatus(orderId, next);
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: label });
        router.refresh();
      }
    });

  const verify = () =>
    startTransition(async () => {
      const res = await verifyManualPayment(orderId);
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: "Payment verified & order confirmed" });
        router.refresh();
      }
    });

  if (status === "completed" || status === "cancelled") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {isAdmin && paymentStatus === "awaiting_verification" && (
        <Button size="sm" variant="success" disabled={pending} onClick={verify}>
          <Check className="h-4 w-4" /> Verify payment
        </Button>
      )}
      {status === "pending" && (
        <Button
          size="sm"
          variant="default"
          disabled={pending}
          onClick={() => advance("confirmed", "Order confirmed")}
        >
          <Check className="h-4 w-4" /> Confirm
        </Button>
      )}
      {status === "confirmed" && (
        <Button
          size="sm"
          variant="success"
          disabled={pending}
          onClick={() => advance("completed", "Order completed")}
        >
          <PackageCheck className="h-4 w-4" /> Mark completed
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => advance("cancelled", "Order cancelled")}
      >
        <X className="h-4 w-4" /> Cancel
      </Button>
    </div>
  );
}
