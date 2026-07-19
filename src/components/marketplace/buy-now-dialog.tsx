"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, Landmark, Smartphone, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createBooking, confirmRazorpayPayment } from "@/app/actions/orders";
import { previewCoupon } from "@/app/actions/coupons";
import { formatINR, formatMobile } from "@/lib/utils";
import type { PaymentMethod } from "@/types/database";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const METHODS: { key: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { key: "razorpay", label: "Pay Online (UPI/Card)", icon: CreditCard },
  { key: "upi", label: "UPI (manual)", icon: Smartphone },
  { key: "bank", label: "Bank Transfer", icon: Landmark },
  { key: "cash", label: "Cash", icon: Banknote },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BuyNowDialog({
  numberId,
  mobileNumber,
  price,
  isAuthed,
  disabled,
}: {
  numberId: string;
  mobileNumber: string;
  price: number;
  isAuthed: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("razorpay");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [couponInput, setCouponInput] = useState("");
  const [couponPending, startCouponTransition] = useTransition();
  const [applied, setApplied] = useState<{ code: string; discountAmount: number; finalPrice: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const finalPrice = applied?.finalPrice ?? price;

  function applyCoupon() {
    setCouponError(null);
    startCouponTransition(async () => {
      const res = await previewCoupon(couponInput, price);
      if (res.error || res.discountAmount === undefined || res.finalPrice === undefined) {
        setCouponError(res.error || "Invalid coupon");
        setApplied(null);
        return;
      }
      setApplied({ code: couponInput.trim().toUpperCase(), discountAmount: res.discountAmount, finalPrice: res.finalPrice });
    });
  }

  function handleBuy() {
    if (!isAuthed) {
      router.push(`/login?next=/number`);
      return;
    }
    startTransition(async () => {
      const res = await createBooking({
        numberId,
        paymentMethod: method,
        customerNote: note || undefined,
        couponCode: applied?.code,
      });
      if (res.error && !res.orderId) {
        toast({ variant: "destructive", title: res.error });
        return;
      }

      if (method === "razorpay" && res.razorpay) {
        const ok = await loadRazorpayScript();
        if (!ok || !window.Razorpay) {
          toast({
            variant: "destructive",
            title: "Could not load payment gateway",
          });
          return;
        }
        const rzp = new window.Razorpay({
          key: res.razorpay.keyId,
          amount: res.razorpay.amount,
          currency: "INR",
          name: "JioVIPNumber.com",
          description: `VIP Number ${formatMobile(mobileNumber)}`,
          order_id: res.razorpay.orderId,
          handler: async (response: Record<string, string>) => {
            const confirm = await confirmRazorpayPayment({
              orderId: res.orderId!,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (confirm.error) {
              toast({ variant: "destructive", title: confirm.error });
            } else {
              toast({ variant: "success", title: "Payment successful!" });
              setOpen(false);
              router.push("/dashboard/orders");
            }
          },
          theme: { color: "#2563eb" },
        });
        rzp.open();
        return;
      }

      // Manual methods
      toast({
        variant: "success",
        title: "Booking placed!",
        description: `Order ${res.orderCode}. Complete payment & upload proof from My Orders.`,
      });
      setOpen(false);
      router.push("/dashboard/orders");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="lg" className="flex-1" disabled={disabled}>
          <ShoppingBag className="h-5 w-5" /> Buy Now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book VIP Number</DialogTitle>
          <DialogDescription>
            {formatMobile(mobileNumber)} ·{" "}
            {applied ? (
              <>
                <span className="line-through">{formatINR(price)}</span>{" "}
                <span className="font-semibold text-accent">{formatINR(finalPrice)}</span>
              </>
            ) : (
              formatINR(price)
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="coupon">Coupon code (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setApplied(null);
                  setCouponError(null);
                }}
                placeholder="FESTIVE10"
                className="uppercase"
              />
              <Button
                type="button"
                variant="outline"
                onClick={applyCoupon}
                disabled={!couponInput || couponPending}
              >
                {couponPending ? "Checking…" : "Apply"}
              </Button>
            </div>
            {couponError && <p className="text-xs text-destructive">{couponError}</p>}
            {applied && (
              <p className="text-xs text-success">
                Code applied — you save {formatINR(applied.discountAmount)}.
              </p>
            )}
          </div>

          <Label>Select payment method</Label>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-all",
                    method === m.key
                      ? "border-primary bg-secondary text-secondary-foreground shadow-glow"
                      : "border-input bg-white/60 hover:bg-secondary/50",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" /> {m.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any message for the seller"
            />
          </div>

          {method !== "razorpay" && (
            <p className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
              After booking, upload your payment screenshot from{" "}
              <b>My Orders</b>. The admin will verify and confirm your order.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleBuy} disabled={pending} variant="gradient">
            {pending ? "Processing…" : `Confirm · ${formatINR(finalPrice)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
