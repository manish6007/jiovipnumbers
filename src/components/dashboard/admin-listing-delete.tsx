"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { adminDeleteListing } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function AdminListingDelete({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await adminDeleteListing(id);
          if (res.error) toast({ variant: "destructive", title: res.error });
          else {
            toast({ variant: "success", title: "Listing deleted" });
            router.refresh();
          }
        })
      }
    >
      <Trash2 className="h-4 w-4" /> Delete
    </Button>
  );
}
