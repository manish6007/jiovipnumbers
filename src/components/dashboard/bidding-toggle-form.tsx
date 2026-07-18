"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBiddingEnabled } from "@/app/actions/admin";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function BiddingToggleForm({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [checked, setChecked] = useState(enabled);

  function toggle(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const res = await updateBiddingEnabled(next);
      if (res.error) {
        setChecked(!next);
        toast({ variant: "destructive", title: res.error });
      } else {
        toast({ variant: "success", title: next ? "Bidding enabled" : "Bidding disabled" });
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 p-4">
      <div>
        <Label className="text-sm font-semibold">Allow timed auctions</Label>
        <p className="text-xs text-muted-foreground">
          When on, partners can list a number as a timed auction and admin can start
          bidding on any approved listing. When off, bidding is hidden everywhere.
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={toggle} disabled={pending} />
    </div>
  );
}
