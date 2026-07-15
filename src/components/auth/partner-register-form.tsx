"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, Phone, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerPartner } from "@/app/actions/partner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { OtpInput } from "./otp-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { formatMobile } from "@/lib/utils";

type Step = "phone" | "otp" | "kyc" | "done";

export function PartnerRegisterForm({ initialStep }: { initialStep: Step }) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(initialStep);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    gstNumber: "",
    panNumber: "",
    address: "",
    upiId: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    logoUrl: "",
    photoUrl: "",
  });
  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const e164 = `+91${phone.replace(/\D/g, "").slice(-10)}`;
  const phoneValid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));

  function sendOtp() {
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (error) {
        toast({ variant: "destructive", title: error.message });
        return;
      }
      setStep("otp");
      toast({ title: "OTP sent", description: `Sent to ${formatMobile(phone)}` });
    });
  }

  function verifyOtp() {
    startTransition(async () => {
      const { error } = await supabase.auth.verifyOtp({ phone: e164, token: otp, type: "sms" });
      if (error) {
        toast({ variant: "destructive", title: "Invalid OTP" });
        return;
      }
      setStep("kyc");
    });
  }

  function submitKyc() {
    if (!form.fullName || !form.businessName || !form.address) {
      return toast({ variant: "destructive", title: "Fill all required fields" });
    }
    startTransition(async () => {
      const res = await registerPartner({
        ...form,
        panNumber: form.panNumber.toUpperCase(),
      });
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      setStep("done");
      router.refresh();
    });
  }

  if (step === "done") {
    return (
      <Card className="p-2">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <BadgeCheck className="h-7 w-7" />
          </span>
          <h2 className="text-xl font-bold">Registration submitted!</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your partner account is pending admin verification. You&apos;ll be
            notified once approved and can then start listing VIP numbers.
          </p>
          <Button variant="gradient" onClick={() => router.push("/partner")}>
            Go to Partner Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Store className="h-6 w-6 text-blue-500" /> Become a Partner
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {step === "phone" && "Verify your mobile number to get started"}
          {step === "otp" && `Enter the OTP sent to ${formatMobile(phone)}`}
          {step === "kyc" && "Tell us about your business"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "phone" && (
          <>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <div className="flex items-center gap-2">
                <span className="flex h-11 items-center rounded-xl border border-input bg-secondary px-3 text-sm font-medium">
                  +91
                </span>
                <Input
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                />
              </div>
            </div>
            <Button onClick={sendOtp} disabled={pending || !phoneValid} variant="gradient" className="w-full">
              <Phone className="h-4 w-4" /> {pending ? "Sending…" : "Send OTP"}
            </Button>
          </>
        )}

        {step === "otp" && (
          <>
            <OtpInput value={otp} onChange={setOtp} />
            <Button onClick={verifyOtp} disabled={pending || otp.length !== 6} variant="gradient" className="w-full">
              {pending ? "Verifying…" : "Verify"}
            </Button>
            <button
              onClick={() => setStep("phone")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Change number
            </button>
          </>
        )}

        {step === "kyc" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name *">
                <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
              </Field>
              <Field label="Business Name *">
                <Input value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
              </Field>
              <Field label="GST Number (optional)">
                <Input value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value)} />
              </Field>
              <Field label="PAN (optional)">
                <Input
                  value={form.panNumber}
                  onChange={(e) => set("panNumber", e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                />
              </Field>
            </div>

            <Field label="Business Address *">
              <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="UPI ID">
                <Input value={form.upiId} onChange={(e) => set("upiId", e.target.value)} placeholder="name@bank" />
              </Field>
              <Field label="Account Holder Name">
                <Input value={form.bankAccountName} onChange={(e) => set("bankAccountName", e.target.value)} />
              </Field>
              <Field label="Bank Account Number">
                <Input value={form.bankAccountNumber} onChange={(e) => set("bankAccountNumber", e.target.value)} />
              </Field>
              <Field label="IFSC Code">
                <Input value={form.bankIfsc} onChange={(e) => set("bankIfsc", e.target.value.toUpperCase())} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Business Logo</Label>
                <ImageUpload bucket="logos" value={form.logoUrl} onChange={(v) => set("logoUrl", v)} label="Logo" />
              </div>
              <div>
                <Label className="mb-2 block">Profile Photo</Label>
                <ImageUpload bucket="avatars" value={form.photoUrl} onChange={(v) => set("photoUrl", v)} label="Photo" />
              </div>
            </div>

            <Button onClick={submitKyc} disabled={pending} variant="gradient" className="w-full">
              {pending ? "Submitting…" : "Submit for Verification"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
