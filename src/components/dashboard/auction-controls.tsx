"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Gavel, Square } from "lucide-react";
import { startAuction, stopAuction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import type { AuctionDurationKey } from "@/lib/bidding";

const DURATION_LABELS: Record<AuctionDurationKey, string> = {
  "24h": "24 hours",
  "3d": "3 days",
  "7d": "7 days",
};

/** Admin-only: start bidding on any already-approved listing, or stop it early. */
export function AuctionControls({
  numberId,
  isAuctionActive,
  fallbackPrice,
}: {
  numberId: string;
  isAuctionActive: boolean;
  fallbackPrice: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [startingBid, setStartingBid] = useState(String(fallbackPrice));
  const [duration, setDuration] = useState<AuctionDurationKey>("3d");

  function start() {
    startTransition(async () => {
      const res = await startAuction(numberId, {
        startingBid: Number(startingBid),
        duration,
      });
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: "Auction started" });
        setOpen(false);
        router.refresh();
      }
    });
  }

  function stop() {
    startTransition(async () => {
      const res = await stopAuction(numberId);
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: "Auction stopped" });
        router.refresh();
      }
    });
  }

  if (isAuctionActive) {
    return (
      <Button size="sm" variant="outline" disabled={pending} onClick={stop}>
        <Square className="h-4 w-4" /> Stop Auction
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Gavel className="h-4 w-4" /> Start Auction
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Start auction</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Starting Bid (₹)</Label>
              <Input
                inputMode="numeric"
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={(v) => setDuration(v as AuctionDurationKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DURATION_LABELS) as AuctionDurationKey[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {DURATION_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" disabled={pending} onClick={start}>
              Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
