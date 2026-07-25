const STATS = [
  { value: "50,000+", label: "VIP Numbers" },
  { value: "500+", label: "Verified Dealers" },
  { value: "10,000+", label: "Happy Customers" },
  { value: "24x7", label: "Support" },
];

export function HeroStats() {
  return (
    <div className="mt-9 flex flex-wrap gap-7">
      {STATS.map((s) => (
        <div key={s.label}>
          <p className="font-poppins text-xl font-extrabold text-white">{s.value}</p>
          <p className="mt-0.5 text-xs font-medium text-white/60">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
