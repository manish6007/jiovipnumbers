const BADGES = [
  { icon: "✅", label: "100% Verified Sellers" },
  { icon: "🔒", label: "Secure Escrow Payment" },
  { icon: "🚚", label: "Pan India Delivery" },
  { icon: "⏱", label: "24x7 Support" },
];

export function TrustBadges() {
  return (
    <section className="container py-8">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-vipCardBorder bg-white p-6 sm:grid-cols-4">
        {BADGES.map((b) => (
          <div key={b.label} className="text-center">
            <p className="mb-1 text-xl">{b.icon}</p>
            <p className="text-xs font-bold">{b.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
