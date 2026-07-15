"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/profile";
import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/database";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  function save() {
    startTransition(async () => {
      const res = await updateProfile({ fullName, email, avatarUrl });
      if (res.error) {
        toast({ variant: "destructive", title: res.error });
        return;
      }
      toast({ variant: "success", title: "Profile updated" });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block">Profile Photo</Label>
        <ImageUpload bucket="avatars" value={avatarUrl} onChange={setAvatarUrl} label="Photo" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Mobile Number</Label>
        <Input value={profile.phone ?? ""} disabled />
        <p className="text-xs text-muted-foreground">Mobile number cannot be changed.</p>
      </div>
      <Button onClick={save} disabled={pending} variant="gradient">
        {pending ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
