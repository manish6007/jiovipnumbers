"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Pencil, Pause, Play, Trash2, IndianRupee } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { setNumberStatus, deleteNumber, changePrice } from "@/app/actions/numbers";
import type { NumberStatus } from "@/types/database";

export function ListingActions({
  id,
  status,
  price,
}: {
  id: string;
  status: NumberStatus;
  price: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [priceOpen, setPriceOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(String(price));

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>, ok: string) =>
    startTransition(async () => {
      const res = await fn();
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: ok });
        router.refresh();
      }
    });

  const isPaused = status === "paused";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/partner/listings/${id}/edit`}>
              <Pencil /> Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPriceOpen(true)}>
            <IndianRupee /> Change price
          </DropdownMenuItem>
          {status !== "sold" && status !== "reserved" && (
            <DropdownMenuItem
              onClick={() =>
                run(
                  () => setNumberStatus(id, isPaused ? "available" : "paused"),
                  isPaused ? "Listing activated" : "Listing paused",
                )
              }
            >
              {isPaused ? <Play /> : <Pause />} {isPaused ? "Activate" : "Pause"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setDelOpen(true)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change price */}
      <Dialog open={priceOpen} onOpenChange={setPriceOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Price</DialogTitle>
          </DialogHeader>
          <Input
            inputMode="numeric"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value.replace(/\D/g, ""))}
          />
          <DialogFooter>
            <Button
              variant="gradient"
              disabled={pending}
              onClick={() => {
                run(() => changePrice(id, Number(newPrice)), "Price updated");
                setPriceOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete listing?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This permanently removes the listing. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => {
                run(() => deleteNumber(id), "Listing deleted");
                setDelOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
