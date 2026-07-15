import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-hero-gradient" />
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline">Terms</Link> &{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
