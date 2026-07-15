"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitPaymentProof } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function PaymentProofUploader({ orderId }: { orderId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Screenshot must be under 5MB" });
      return;
    }
    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user?.id}/${orderId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("payment-screenshots")
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (error) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
      return;
    }
    startTransition(async () => {
      const res = await submitPaymentProof({ orderId, screenshotUrl: path });
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      toast({ variant: "success", title: "Payment proof submitted for verification" });
      router.refresh();
    });
  }

  return (
    <label>
      <Button
        asChild
        size="sm"
        variant="outline"
        disabled={uploading || pending}
      >
        <span className="cursor-pointer">
          <Upload className="h-4 w-4" />
          {uploading || pending ? "Uploading…" : "Upload payment proof"}
        </span>
      </Button>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading || pending}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </label>
  );
}
