import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/types/database";

/**
 * Auto-scrolling marquee strip on a dark backdrop. The track renders the
 * banner list twice back-to-back so the CSS translateX(-50%) loop is
 * seamless; hovering pauses it (see `.vip-marquee-track` in globals.css).
 */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  const loop = [...banners, ...banners];

  return (
    <section className="bg-vipNavy-900 pt-6">
      <div className="container mb-3 flex items-center justify-between">
        <p className="font-display text-base font-extrabold text-white">📢 Offers &amp; Updates</p>
        <p className="text-xs font-medium text-white/50">{banners.length} active banners</p>
      </div>
      <div className="overflow-hidden pb-6">
        <div className="vip-marquee-track gap-4 px-4">
          {loop.map((b, i) => {
            const card = (
              <div className="relative h-32 w-72 flex-none overflow-hidden rounded-2xl">
                <Image
                  src={b.image_url}
                  alt={b.title || "Banner"}
                  fill
                  className="object-cover"
                  sizes="288px"
                />
                {(b.title || b.subtitle) && (
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4">
                    {b.title && (
                      <p className="font-display text-sm font-extrabold text-white">{b.title}</p>
                    )}
                    {b.subtitle && (
                      <p className="mt-0.5 text-xs text-white/80">{b.subtitle}</p>
                    )}
                  </div>
                )}
              </div>
            );
            return (
              <div key={`${b.id}-${i}`}>
                {b.link_url ? <Link href={b.link_url}>{card}</Link> : card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
