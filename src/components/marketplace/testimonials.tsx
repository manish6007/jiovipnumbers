// Placeholder testimonials — there's no reviews/testimonials table in the
// schema yet, so this is static copy until that feature exists.
const TESTIMONIALS = [
  { name: "Rohit Sharma", city: "Delhi", initial: "R", quote: "Bahut accha experience raha! Number time pe mila aur SIM bhi ghar tak deliver hui." },
  { name: "Priya Patel", city: "Ahmedabad", initial: "P", quote: "Verified dealers hone ki wajah se full trust ke saath order kiya. Highly recommended!" },
  { name: "Amit Verma", city: "Jaipur", initial: "A", quote: "Selection bahut wide hai aur prices bhi genuine. Dobara zaroor kharidunga." },
  { name: "Sanjay Yadav", city: "Lucknow", initial: "S", quote: "Mera lucky number isi site se mila. Booking se delivery tak sab kuch smooth tha." },
  { name: "Kavita Nair", city: "Kochi", initial: "K", quote: "WhatsApp par turant reply mil gaya aur price bhi best tha market mein." },
  { name: "Fatima Sheikh", city: "Hyderabad", initial: "F", quote: "Payment secure tha aur order tracking bhi mila. Bharosa kar sakte hain." },
];

export function Testimonials() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section className="container py-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-center gap-2.5">
        <p className="font-display text-2xl font-extrabold">What Our Customers Say</p>
        <span className="text-sm font-bold text-[#d1791f]">★ 4.8/5 (2,500+ reviews)</span>
      </div>
      <div className="overflow-hidden">
        <div className="vip-marquee-track gap-4" style={{ animationDuration: "34s" }}>
          {loop.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="w-72 flex-none rounded-2xl border border-vipCardBorder bg-white p-5"
            >
              <p className="mb-2 text-[#f0a83c]">★★★★★</p>
              <p className="text-sm leading-relaxed text-foreground/80">{t.quote}</p>
              <div className="mt-3.5 flex items-center gap-2.5">
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {t.initial}
                </div>
                <div>
                  <p className="text-xs font-bold">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
