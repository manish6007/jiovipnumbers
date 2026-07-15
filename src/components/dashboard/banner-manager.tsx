"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { saveBanner, deleteBanner } from "@/app/actions/admin";
import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { Banner } from "@/types/database";

export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
  });

  function create() {
    if (!draft.imageUrl) {
      toast({ variant: "destructive", title: "Upload a banner image first" });
      return;
    }
    startTransition(async () => {
      const res = await saveBanner({ ...draft, sortOrder: banners.length, isActive: true });
      if (res.error) toast({ variant: "destructive", title: res.error });
      else {
        toast({ variant: "success", title: "Banner added" });
        setDraft({ title: "", subtitle: "", imageUrl: "", linkUrl: "" });
        router.refresh();
      }
    });
  }

  function toggleActive(b: Banner) {
    startTransition(async () => {
      await saveBanner({
        id: b.id,
        title: b.title ?? "",
        subtitle: b.subtitle ?? "",
        imageUrl: b.image_url,
        linkUrl: b.link_url ?? "",
        sortOrder: b.sort_order,
        isActive: !b.is_active,
      });
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteBanner(id);
      toast({ variant: "success", title: "Banner deleted" });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <h3 className="font-semibold">Add New Banner</h3>
          <div className="flex flex-col gap-4 sm:flex-row">
            <ImageUpload
              bucket="banners"
              value={draft.imageUrl}
              onChange={(v) => setDraft((d) => ({ ...d, imageUrl: v }))}
              label="Banner"
            />
            <div className="flex-1 space-y-3">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Subtitle</Label>
                <Input value={draft.subtitle} onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Link URL</Label>
                <Input
                  value={draft.linkUrl}
                  onChange={(e) => setDraft((d) => ({ ...d, linkUrl: e.target.value }))}
                  placeholder="/search?category=business"
                />
              </div>
              <Button onClick={create} disabled={pending} variant="gradient">
                <Plus className="h-4 w-4" /> Add Banner
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {banners.map((b) => (
          <Card key={b.id}>
            <CardContent className="space-y-3 p-4">
              <div className="relative h-32 w-full overflow-hidden rounded-xl">
                <Image src={b.image_url} alt={b.title || "Banner"} fill className="object-cover" />
              </div>
              <div>
                <p className="font-semibold">{b.title || "Untitled"}</p>
                <p className="text-xs text-muted-foreground">{b.subtitle}</p>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b)} />
                  {b.is_active ? "Active" : "Hidden"}
                </label>
                <Button size="sm" variant="outline" onClick={() => remove(b.id)} disabled={pending}>
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
