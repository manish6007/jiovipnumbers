import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-vipNavy-900 text-white/70">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo wordmarkClassName="text-white" />
          <p className="max-w-xs text-sm text-white/60">
            India&apos;s trusted multi-vendor marketplace for premium, fancy and
            VIP mobile numbers from verified sellers.
          </p>
        </div>

        <FooterCol
          title="Explore"
          links={[
            { href: "/search", label: "All Numbers" },
            { href: "/search?category=business", label: "Business Numbers" },
            { href: "/search?category=lucky", label: "Lucky Numbers" },
            { href: "/search?pattern=mirror", label: "Mirror Numbers" },
          ]}
        />
        <FooterCol
          title="Sell"
          links={[
            { href: "/register/partner", label: "Become a Partner" },
            { href: "/partner", label: "Partner Dashboard" },
            { href: "/login", label: "Partner Login" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { href: "/about", label: "About Us" },
            { href: "/contact", label: "Contact" },
            { href: "/terms", label: "Terms & Conditions" },
            { href: "/privacy", label: "Privacy Policy" },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} JioVIPNumber.com. All rights reserved.</p>
          <p>Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <ul className="space-y-2 text-sm text-white/60">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
