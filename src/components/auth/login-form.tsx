"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { OtpInput } from "./otp-input";
import { GoogleButton } from "./google-button";
import { cn, formatMobile } from "@/lib/utils";

type Method = "phone" | "email";

export function LoginForm({
  phoneEnabled = true,
  emailEnabled = false,
  googleEnabled = false,
}: {
  phoneEnabled?: boolean;
  emailEnabled?: boolean;
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const supabase = createClient();
  const { toast } = useToast();

  const [method, setMethod] = useState<Method>(phoneEnabled ? "phone" : "email");
  const [step, setStep] = useState<"credential" | "otp">("credential");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, startTransition] = useTransition();

  const e164 = `+91${phone.replace(/\D/g, "").slice(-10)}`;
  const phoneValid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const credentialValid = method === "phone" ? phoneValid : emailValid;
  // Supabase's email OTP token length differs from the SMS one configured in
  // this project (6 digits for phone, 8 for email) — read from the dashboard's
  // Auth settings if you change either.
  const otpLength = method === "phone" ? 6 : 8;

  function sendOtp() {
    if (!credentialValid) {
      toast({
        variant: "destructive",
        title: method === "phone" ? "Enter a valid 10-digit mobile number" : "Enter a valid email",
      });
      return;
    }
    startTransition(async () => {
      const { error } =
        method === "phone"
          ? await supabase.auth.signInWithOtp({ phone: e164 })
          : await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) {
        toast({ variant: "destructive", title: "Could not send code", description: error.message });
        return;
      }
      setStep("otp");
      toast({
        title: "Code sent",
        description: method === "phone" ? `Sent to ${formatMobile(phone)}` : `Sent to ${email}`,
      });
    });
  }

  function verifyOtp() {
    if (otp.length !== otpLength) return;
    startTransition(async () => {
      const { error } =
        method === "phone"
          ? await supabase.auth.verifyOtp({ phone: e164, token: otp, type: "sms" })
          : await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
      if (error) {
        toast({ variant: "destructive", title: "Invalid code", description: error.message });
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
          {step === "credential" ? "Welcome back" : "Verify code"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {step === "credential"
            ? "Login or sign up to continue"
            : `Enter the ${otpLength}-digit code sent to ${method === "phone" ? formatMobile(phone) : email}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "credential" ? (
          <>
            {googleEnabled && (
              <>
                <GoogleButton next={next} />
                {(phoneEnabled || emailEnabled) && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                  </div>
                )}
              </>
            )}

            {phoneEnabled && emailEnabled && (
              <div className="flex gap-1 rounded-xl bg-secondary p-1">
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium transition-colors",
                    method === "phone" ? "bg-card shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <Phone className="h-3.5 w-3.5" /> Phone
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium transition-colors",
                    method === "email" ? "bg-card shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </button>
              </div>
            )}

            {method === "phone" && phoneEnabled ? (
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
            ) : (
              emailEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  />
                </div>
              )
            )}

            {(phoneEnabled || emailEnabled) && (
              <Button onClick={sendOtp} disabled={pending || !credentialValid} className="w-full" variant="gradient">
                {method === "phone" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}{" "}
                {pending ? "Sending…" : "Send Code"}
              </Button>
            )}
          </>
        ) : (
          <>
            <OtpInput value={otp} onChange={setOtp} length={otpLength} />
            <Button onClick={verifyOtp} disabled={pending || otp.length !== otpLength} className="w-full" variant="gradient">
              {pending ? "Verifying…" : "Verify & Continue"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => setStep("credential")}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change {method === "phone" ? "number" : "email"}
              </button>
              <button onClick={sendOtp} disabled={pending} className="text-primary hover:underline">
                Resend Code
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
