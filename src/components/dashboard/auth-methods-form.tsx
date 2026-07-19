"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAuthMethods } from "@/app/actions/admin";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function AuthMethodsForm({
  phoneOtp,
  emailOtp,
  googleOauth,
}: {
  phoneOtp: boolean;
  emailOtp: boolean;
  googleOauth: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({ phoneOtp, emailOtp, googleOauth });

  function save() {
    startTransition(async () => {
      const res = await updateAuthMethods(state);
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
      } else {
        toast({ variant: "success", title: "Login methods updated" });
        router.refresh();
      }
    });
  }

  const rows = [
    {
      key: "phoneOtp" as const,
      label: "Phone OTP",
      hint: "Costs money per SMS (MSG91). Turn off once other methods cover your traffic.",
    },
    {
      key: "emailOtp" as const,
      label: "Email OTP",
      hint: "Free via Supabase's built-in email sending (low-volume; add custom SMTP for scale).",
    },
    {
      key: "googleOauth" as const,
      label: "Google Sign-In",
      hint: "Free, requires Google OAuth credentials configured in Supabase first.",
    },
  ];

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center justify-between gap-4 rounded-xl bg-secondary/50 p-4">
          <div>
            <Label className="text-sm font-semibold">{row.label}</Label>
            <p className="text-xs text-muted-foreground">{row.hint}</p>
          </div>
          <Switch
            checked={state[row.key]}
            onCheckedChange={(v) => setState((s) => ({ ...s, [row.key]: v }))}
            disabled={pending}
          />
        </div>
      ))}
      <Button onClick={save} disabled={pending} variant="gradient">
        {pending ? "Saving…" : "Save Login Methods"}
      </Button>
    </div>
  );
}
