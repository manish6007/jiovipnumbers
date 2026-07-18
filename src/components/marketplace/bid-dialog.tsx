"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Gavel } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { placeBid } from "@/app/actions/bids";
import { minNextBid } from "@/lib/bidding";
import { formatINR, formatMobile } from "@/lib/utils";

export function BidDialog({
  numberId,
  mobileNumber,
  currentBid,
  startingBid,
  isAuthed,
  disabled,
}: {
  numberId: string;
  mobileNumber: string;
  currentBid: number | null;
  startingBid: number;
  isAuthed: boolean;
  disabled?: boolean;
}) {
  const minNext = minNextBid(currentBid ?? startingBid);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(minNext));
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleBid() {
    if (!isAuthed) {
      router.push(`/login?next=/number`);
      return;
    }
    startTransition(async () => {
      const res = await placeBid({ numberId, amount: Number(amount) });
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        if (res.minNext) setAmount(String(res.minNext));
        return;
      }
      toast({ variant: "success", title: "Bid placed!" });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="lg" className="flex-1" disabled={disabled}>
          <Gavel className="h-5 w-5" /> Place Bid
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place a bid</DialogTitle>
          <DialogDescription>
            {formatMobile(mobileNumber)} · Current bid {formatINR(currentBid ?? startingBid)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="bid-amount">Your bid (₹) — minimum {formatINR(minNext)}</Label>
          <Input
            id="bid-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <p className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
          If you have the highest bid when the timer ends, you win the number and get
          a window to complete payment from <b>My Orders</b>.
        </p>

        <DialogFooter>
          <Button onClick={handleBid} disabled={pending} variant="gradient">
            {pending ? "Placing…" : `Bid ${formatINR(Number(amount) || 0)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
