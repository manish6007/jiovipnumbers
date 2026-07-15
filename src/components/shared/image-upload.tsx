"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

/**
 * Uploads a single image to a Supabase Storage bucket and returns its public
 * URL (public buckets) or storage path (private buckets). For private buckets
 * pass `returnPath` so callers store the object path and sign it server-side.
 */
export function ImageUpload({
  bucket,
  value,
  onChange,
  label = "Upload image",
  returnPath = false,
  className,
}: {
  bucket: string;
  value?: string;
  onChange: (urlOrPath: string) => void;
  label?: string;
  returnPath?: boolean;
  className?: string;
}) {
  const supabase = createClient();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Image must be under 5MB" });
      return;
    }
    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user?.id ?? "anon"}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
    });
    setUploading(false);
    if (error) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
      return;
    }
    if (returnPath) {
      onChange(path);
    } else {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    }
  }

  const preview = value && !returnPath ? value : null;

  return (
    <div className={cn("space-y-2", className)}>
      {preview ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-input">
          <Image src={preview} alt="Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-white/50 text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary",
          )}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <span>{uploading ? "Uploading…" : label}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      )}
      {returnPath && value && (
        <p className="text-xs text-success">✓ File uploaded</p>
      )}
    </div>
  );
}
