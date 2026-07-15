import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero-gradient px-4 text-center">
      <SearchX className="mb-4 h-16 w-16 text-blue-500" />
      <h1 className="text-4xl font-extrabold">404</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page or number you&apos;re looking for doesn&apos;t exist or is no
        longer available.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild variant="gradient">
          <Link href="/">
            <Home className="h-4 w-4" /> Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">Browse Numbers</Link>
        </Button>
      </div>
    </div>
  );
}
