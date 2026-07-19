"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createCoupon, updateCoupon, deleteCoupon, toggleCouponActive } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatINR } from "@/lib/utils";
import type { Coupon, DiscountType } from "@/types/database";

const emptyDraft = {
  code: "",
  discountType: "percentage" as DiscountType,
  discountValue: "",
  minOrderValue: "",
  maxUses: "",
  expiresAt: "",
};

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const set = (k: keyof typeof draft, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  function startEdit(c: Coupon) {
    setEditingId(c.id);
    setDraft({
      code: c.code,
      discountType: c.discount_type,
      discountValue: String(c.discount_value),
      minOrderValue: c.min_order_value ? String(c.min_order_value) : "",
      maxUses: c.max_uses ? String(c.max_uses) : "",
      expiresAt: c.expires_at ? c.expires_at.slice(0, 10) : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  function save() {
    if (!draft.code || !draft.discountValue) {
      toast({ variant: "destructive", title: "Enter a code and discount value" });
      return;
    }
    const payload = {
      code: draft.code,
      discountType: draft.discountType,
      discountValue: Number(draft.discountValue),
      minOrderValue: draft.minOrderValue ? Number(draft.minOrderValue) : ("" as const),
      maxUses: draft.maxUses ? Number(draft.maxUses) : ("" as const),
      expiresAt: draft.expiresAt,
    };
    startTransition(async () => {
      const res = editingId
        ? await updateCoupon(editingId, payload)
        : await createCoupon(payload);
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      toast({ variant: "success", title: editingId ? "Coupon updated" : "Coupon created" });
      cancelEdit();
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteCoupon(id);
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: "Coupon deleted" });
        router.refresh();
      }
    });
  }

  function toggleActive(c: Coupon) {
    startTransition(async () => {
      await toggleCouponActive(c.id, !c.is_active);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <h3 className="font-semibold">{editingId ? "Edit Coupon" : "Create Coupon"}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                value={draft.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="FESTIVE10"
                className="uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discount Type</Label>
              <Select
                value={draft.discountType}
                onValueChange={(v) => set("discountType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{draft.discountType === "percentage" ? "Percentage" : "Amount (₹)"}</Label>
              <Input
                inputMode="numeric"
                value={draft.discountValue}
                onChange={(e) => set("discountValue", e.target.value.replace(/[^\d.]/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min Order Value (optional)</Label>
              <Input
                inputMode="numeric"
                value={draft.minOrderValue}
                onChange={(e) => set("minOrderValue", e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max Uses (optional)</Label>
              <Input
                inputMode="numeric"
                value={draft.maxUses}
                onChange={(e) => set("maxUses", e.target.value.replace(/\D/g, ""))}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expires On (optional)</Label>
              <Input
                type="date"
                value={draft.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={pending} variant="gradient">
              <Plus className="h-4 w-4" /> {editingId ? "Save Changes" : "Create Coupon"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={cancelEdit} disabled={pending}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {coupons.length === 0 && (
          <p className="text-sm text-muted-foreground">No coupons yet.</p>
        )}
        {coupons.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="vip-number text-lg font-bold">{c.code}</span>
                  <span className="text-sm font-semibold text-accent">
                    {c.discount_type === "percentage"
                      ? `${c.discount_value}% off`
                      : `${formatINR(Number(c.discount_value))} off`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {c.used_count} / {c.max_uses ?? "∞"} used
                  {c.min_order_value ? ` · min ${formatINR(c.min_order_value)}` : ""}
                  {c.expires_at ? ` · expires ${c.expires_at.slice(0, 10)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                  {c.is_active ? "Active" : "Disabled"}
                </label>
                <Button size="sm" variant="outline" onClick={() => startEdit(c)} disabled={pending}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(c.id)} disabled={pending}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
