import Link from "next/link";

const CARDS = [
  {
    icon: "🎁",
    title: "Launch Offer",
    subtitle: "Flat 10% OFF on all Premium Numbers",
    cta: "Grab Now",
    href: "/search",
    bg: "linear-gradient(135deg,#e0432b,#a8271b)",
  },
  {
    icon: "💎",
    title: "Premium Numbers",
    subtitle: "Handpicked & elite VIP numbers",
    cta: "Explore",
    href: "/search?sort=price_desc",
    bg: "linear-gradient(135deg,#8b5cf6,#5b21b6)",
  },
  {
    icon: "🔥",
    title: "Trending Numbers",
    subtitle: "Most popular & in-demand numbers",
    cta: "View Now",
    href: "/search?sort=trending",
    bg: "linear-gradient(135deg,#f0a83c,#c2531f)",
  },
  {
    icon: "👑",
    title: "VIP Collection",
    subtitle: "Exclusive & elite VIP numbers",
    cta: "Discover",
    href: "/search?sort=newest",
    bg: "linear-gradient(135deg,#2563eb,#1d3faa)",
  },
];

export function QuickCategoryCards() {
  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div
            key={c.title}
            className="flex flex-col gap-1.5 rounded-2xl p-5 text-white"
            style={{ background: c.bg }}
          >
            <span className="text-2xl">{c.icon}</span>
            <p className="font-poppins mt-1 text-base font-extrabold">{c.title}</p>
            <p className="mb-2 text-xs text-white/85">{c.subtitle}</p>
            <Link
              href={c.href}
              className="inline-flex w-fit items-center gap-1 rounded-lg bg-white/20 px-3.5 py-2 text-xs font-bold transition-colors hover:bg-white/30"
            >
              {c.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
