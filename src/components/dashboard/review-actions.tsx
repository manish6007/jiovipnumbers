"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { reviewPartner, reviewListing } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export function ReviewActions({
  entity,
  id,
}: {
  entity: "partner" | "listing";
  id: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  function approve() {
    startTransition(async () => {
      const res =
        entity === "partner"
          ? await reviewPartner(id, "approved")
          : await reviewListing(id, "approved");
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: "Approved" });
        router.refresh();
      }
    });
  }

  function reject() {
    startTransition(async () => {
      const res =
        entity === "partner"
          ? await reviewPartner(id, "rejected", reason)
          : await reviewListing(id, "rejected", reason);
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: "Rejected" });
        setRejectOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="success" disabled={pending} onClick={approve}>
          <Check className="h-4 w-4" /> Approve
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setRejectOpen(true)}>
          <X className="h-4 w-4" /> Reject
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject {entity}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (shared with the partner)"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={pending} onClick={reject}>
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
