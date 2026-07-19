"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

/** Redirects to Google; Supabase sends the browser back to /auth/callback. */
export function GoogleButton({ next }: { next: string }) {
  const supabase = createClient();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      toast({ variant: "destructive", title: "Could not start Google sign-in", description: error.message });
      setPending(false);
    }
    // On success the browser navigates away to Google, so no further state update needed here.
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={signIn} disabled={pending}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.89c2.28-2.1 3.53-5.19 3.53-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-2.98c-1.08.72-2.46 1.15-4.04 1.15-3.11 0-5.74-2.1-6.68-4.92H1.3v3.07C3.27 21.3 7.31 24 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.32 14.34A7.2 7.2 0 0 1 4.94 12c0-.81.14-1.6.38-2.34V6.59H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.41l4.02-3.07Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.76 0 3.35.61 4.6 1.79l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.27 2.7 1.3 6.59l4.02 3.07C6.26 6.85 8.89 4.75 12 4.75Z"
        />
      </svg>
      {pending ? "Redirecting…" : "Continue with Google"}
    </Button>
  );
}
