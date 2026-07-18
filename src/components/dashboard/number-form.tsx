"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { analyzeNumber, isValidIndianMobile } from "@/lib/patterns";
import { createNumber, updateNumber } from "@/app/actions/numbers";
import { OPERATORS, STATES, CIRCLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { formatINR } from "@/lib/utils";
import type { AuctionDurationKey } from "@/lib/bidding";
import type { Category, VipNumber } from "@/types/database";

const NONE = "__none__";
const DURATION_LABELS: Record<AuctionDurationKey, string> = {
  "24h": "24 hours",
  "3d": "3 days",
  "7d": "7 days",
};

export function NumberForm({
  categories,
  existing,
  existingImages = [],
  biddingEnabled = false,
}: {
  categories: Category[];
  existing?: VipNumber;
  existingImages?: string[];
  biddingEnabled?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    mobileNumber: existing?.mobile_number ?? "",
    operator: existing?.operator ?? "Jio",
    state: existing?.state ?? "",
    circle: existing?.circle ?? "",
    categoryId: existing?.category_id ?? "",
    sellingPrice: existing ? String(existing.selling_price) : "",
    description: existing?.description ?? "",
  });
  const [images, setImages] = useState<string[]>(existingImages);
  const [isAuction, setIsAuction] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState<AuctionDurationKey>("3d");
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const digits = form.mobileNumber.replace(/\D/g, "").slice(-10);
  const valid = isValidIndianMobile(digits);
  const patterns = valid ? analyzeNumber(digits) : null;

  function submit() {
    startTransition(async () => {
      const payload = {
        mobileNumber: form.mobileNumber,
        operator: form.operator,
        state: form.state,
        circle: form.circle,
        categoryId: form.categoryId,
        sellingPrice: Number(form.sellingPrice),
        description: form.description,
      };
      const res = existing
        ? await updateNumber(existing.id, payload)
        : await createNumber({
            ...payload,
            imageUrls: images,
            isAuction,
            auctionDuration: isAuction ? auctionDuration : undefined,
          });
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      toast({
        variant: "success",
        title: existing ? "Listing updated" : "Listing submitted for approval",
      });
      router.push("/partner/listings");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Mobile Number *</Label>
          <Input
            inputMode="numeric"
            value={form.mobileNumber}
            onChange={(e) => set("mobileNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="9876543210"
            className="vip-number text-lg"
          />
          {digits.length === 10 && !valid && (
            <p className="text-xs text-destructive">Enter a valid Indian mobile number.</p>
          )}
          {patterns && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="outline">Sum {patterns.digitSum}</Badge>
              {patterns.hasRepeatedDigits && <Badge variant="secondary">Repeating</Badge>}
              {patterns.isAscending && <Badge variant="secondary">Ascending</Badge>}
              {patterns.isDescending && <Badge variant="secondary">Descending</Badge>}
              {patterns.isMirror && <Badge variant="premium">Mirror</Badge>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{isAuction ? "Starting Bid (₹) *" : "Selling Price (₹) *"}</Label>
          <Input
            inputMode="numeric"
            value={form.sellingPrice}
            onChange={(e) => set("sellingPrice", e.target.value.replace(/\D/g, ""))}
            placeholder="25000"
          />
          {form.sellingPrice && (
            <p className="text-xs text-muted-foreground">
              {formatINR(Number(form.sellingPrice))}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Operator</Label>
          <Select value={form.operator} onValueChange={(v) => set("operator", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={form.categoryId || NONE}
            onValueChange={(v) => set("categoryId", v === NONE ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Uncategorized</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>State</Label>
          <Select value={form.state || NONE} onValueChange={(v) => set("state", v === NONE ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Circle</Label>
          <Select value={form.circle || NONE} onValueChange={(v) => set("circle", v === NONE ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select circle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>—</SelectItem>
              {CIRCLES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Highlight what makes this number special…"
        />
      </div>

      {!existing && biddingEnabled && (
        <div className="space-y-3 rounded-xl border border-dashed border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-semibold">List as timed auction</Label>
              <p className="text-xs text-muted-foreground">
                Instead of a fixed price, buyers bid until the timer ends. If nobody
                bids, it falls back to the price above.
              </p>
            </div>
            <Switch checked={isAuction} onCheckedChange={setIsAuction} />
          </div>
          {isAuction && (
            <div className="space-y-1.5">
              <Label>Auction Duration</Label>
              <Select
                value={auctionDuration}
                onValueChange={(v) => setAuctionDuration(v as AuctionDurationKey)}
              >
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
              <p className="text-xs text-muted-foreground">
                The timer starts once admin approves this listing, not now.
              </p>
            </div>
          )}
        </div>
      )}

      {!existing && (
        <div className="space-y-2">
          <Label>Images (optional)</Label>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <ImageUpload
                key={i}
                bucket="number-images"
                value={url}
                onChange={(v) =>
                  setImages((imgs) => imgs.map((u, idx) => (idx === i ? v : u)).filter(Boolean))
                }
              />
            ))}
            {images.length < 4 && (
              <ImageUpload
                bucket="number-images"
                value=""
                onChange={(v) => v && setImages((imgs) => [...imgs, v])}
                label="Add image"
              />
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={submit} disabled={pending || !valid} variant="gradient">
          {pending ? "Saving…" : existing ? "Update Listing" : "Submit for Approval"}
        </Button>
        <Button variant="outline" onClick={() => router.back()} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
