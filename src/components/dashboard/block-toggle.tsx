"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2 } from "lucide-react";
import { toggleBlockCustomer } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function BlockToggle({ userId, blocked }: { userId: string; blocked: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={blocked ? "success" : "outline"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await toggleBlockCustomer(userId, !blocked);
          if (res.error) toast({ variant: "destructive", title: res.error });
          else {
            toast({ variant: "success", title: blocked ? "User unblocked" : "User blocked" });
            router.refresh();
          }
        })
      }
    >
      {blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
      {blocked ? "Unblock" : "Block"}
    </Button>
  );
}
