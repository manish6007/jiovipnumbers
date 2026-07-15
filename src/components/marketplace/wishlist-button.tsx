"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function WishlistButton({
  numberId,
  initialSaved,
  isAuthed,
}: {
  numberId: string;
  initialSaved: boolean;
  isAuthed: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function onClick() {
    if (!isAuthed) {
      router.push(`/login?next=/number`);
      return;
    }
    startTransition(async () => {
      const res = await toggleWishlist(numberId);
      if (res.error) {
        toast({ variant: "destructive", title: "Could not update wishlist" });
        return;
      }
      setSaved(res.saved!);
      toast({
        title: res.saved ? "Added to wishlist" : "Removed from wishlist",
      });
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={pending}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className="shrink-0"
    >
      <Heart
        className={cn("h-5 w-5", saved && "fill-rose-500 text-rose-500")}
      />
    </Button>
  );
}
