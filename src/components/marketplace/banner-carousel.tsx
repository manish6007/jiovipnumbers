"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/types/database";
import { cn } from "@/lib/utils";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <section className="container pt-6">
      <div className="relative aspect-[16/6] w-full overflow-hidden rounded-3xl shadow-glass-lg">
        {banners.map((b, i) => {
          const content = (
            <Image
              src={b.image_url}
              alt={b.title || "Banner"}
              fill
              priority={i === 0}
              className="object-cover"
            />
          );
          return (
            <div
              key={b.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              {b.link_url ? <Link href={b.link_url}>{content}</Link> : content}
              {(b.title || b.subtitle) && (
                <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/50 to-transparent p-8 text-white">
                  {b.title && <h2 className="text-2xl font-bold sm:text-4xl">{b.title}</h2>}
                  {b.subtitle && <p className="mt-2 max-w-md text-sm sm:text-base">{b.subtitle}</p>}
                </div>
              )}
            </div>
          );
        })}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-2 bg-white/60",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
