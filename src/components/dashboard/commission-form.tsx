"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCommission } from "@/app/actions/admin";
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
import { useToast } from "@/components/ui/use-toast";
import { calculateCommission } from "@/lib/commission";
import { formatINR } from "@/lib/utils";
import type { CommissionType } from "@/types/database";

export function CommissionForm({
  current,
}: {
  current: { type: CommissionType; value: number };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<CommissionType>(current.type);
  const [value, setValue] = useState(String(current.value));

  const sample = calculateCommission(10000, { type, value: Number(value) || 0 });

  function save() {
    startTransition(async () => {
      const res = await updateCommission({ type, value: Number(value) });
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: "Commission updated" });
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Commission Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as CommissionType)}>
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
          <Label>{type === "percentage" ? "Percentage" : "Amount (₹)"}</Label>
          <Input
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ""))}
          />
        </div>
      </div>

      <div className="rounded-xl bg-secondary/50 p-4 text-sm">
        <p className="mb-2 font-semibold">Example on a ₹10,000 sale</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>Customer pays: <b className="text-foreground">{formatINR(sample.customerPays)}</b></li>
          <li>Admin earns: <b className="text-foreground">{formatINR(sample.commissionAmount)}</b></li>
          <li>Partner receives: <b className="text-foreground">{formatINR(sample.partnerEarning)}</b></li>
        </ul>
      </div>

      <Button onClick={save} disabled={pending} variant="gradient">
        {pending ? "Saving…" : "Update Commission"}
      </Button>
    </div>
  );
}
