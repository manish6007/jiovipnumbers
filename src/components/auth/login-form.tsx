"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { OtpInput } from "./otp-input";
import { formatMobile } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const supabase = createClient();
  const { toast } = useToast();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, startTransition] = useTransition();

  const e164 = `+91${phone.replace(/\D/g, "").slice(-10)}`;
  const phoneValid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));

  function sendOtp() {
    if (!phoneValid) {
      toast({ variant: "destructive", title: "Enter a valid 10-digit mobile number" });
      return;
    }
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (error) {
        toast({ variant: "destructive", title: "Could not send OTP", description: error.message });
        return;
      }
      setStep("otp");
      toast({ title: "OTP sent", description: `Sent to ${formatMobile(phone)}` });
    });
  }

  function verifyOtp() {
    if (otp.length !== 6) return;
    startTransition(async () => {
      const { error } = await supabase.auth.verifyOtp({
        phone: e164,
        token: otp,
        type: "sms",
      });
      if (error) {
        toast({ variant: "destructive", title: "Invalid OTP", description: error.message });
        return;
      }
      router.push(next);
      router.refresh();
    });
  }

  return (
    <Card className="p-2">
      <CardHeader>
        <CardTitle className="text-2xl">
          {step === "phone" ? "Welcome back" : "Verify OTP"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {step === "phone"
            ? "Login or sign up with your mobile number"
            : `Enter the 6-digit code sent to ${formatMobile(phone)}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "phone" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex items-center gap-2">
                <span className="flex h-11 items-center rounded-xl border border-input bg-secondary px-3 text-sm font-medium">
                  +91
                </span>
                <Input
                  id="phone"
                  inputMode="numeric"
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                />
              </div>
            </div>
            <Button onClick={sendOtp} disabled={pending || !phoneValid} className="w-full" variant="gradient">
              <Phone className="h-4 w-4" /> {pending ? "Sending…" : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <OtpInput value={otp} onChange={setOtp} />
            <Button onClick={verifyOtp} disabled={pending || otp.length !== 6} className="w-full" variant="gradient">
              {pending ? "Verifying…" : "Verify & Continue"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => setStep("phone")}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change number
              </button>
              <button onClick={sendOtp} disabled={pending} className="text-primary hover:underline">
                Resend OTP
              </button>
            </div>
          </>
        )}

        <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-3 text-center text-sm">
          <Store className="mx-auto mb-1 h-4 w-4 text-blue-500" />
          Want to sell VIP numbers?{" "}
          <Link href="/register/partner" className="font-semibold text-primary hover:underline">
            Register as Partner
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
