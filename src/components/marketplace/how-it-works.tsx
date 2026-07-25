const STEPS = [
  { n: "1", title: "Search", desc: "Apna pasand ka number dhoondo" },
  { n: "2", title: "Book", desc: "Cart mein add karke order karo" },
  { n: "3", title: "Pay", desc: "Secure payment karo" },
  { n: "4", title: "Get SIM", desc: "SIM ghar baithe paayein" },
];

export function HowItWorks() {
  return (
    <section className="container py-10">
      <p className="font-poppins mb-6 text-center text-2xl font-extrabold">How It Works</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-vipCardBorder bg-white p-5 text-center"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-vipNavy-800 to-vipNavy-900 font-poppins text-lg font-extrabold text-[#f0c988]">
              {s.n}
            </div>
            <p className="font-poppins text-sm font-bold">{s.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
