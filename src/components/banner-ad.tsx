"use client";

import { useEffect } from "react";

type BannerAdProps = {
  className?: string;
  label?: string;
};

const adSenseClient = "ca-pub-8137251460969383";
const adSenseSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "9482939667";
const adHref = process.env.NEXT_PUBLIC_AD_BANNER_URL;
const adImage = process.env.NEXT_PUBLIC_AD_BANNER_IMAGE_URL;
const adText =
  process.env.NEXT_PUBLIC_AD_BANNER_TEXT ??
  "広告スペース: あなたの音楽、イベント、ZINEなど";

export function BannerAd({ className = "", label = "Sponsored" }: BannerAdProps) {
  useEffect(() => {
    if (!adSenseSlot) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle.push({});
    } catch {
      // Ad blockers or delayed script loading can prevent initialization.
    }
  }, []);

  if (adSenseSlot) {
    return (
      <aside
        aria-label="広告"
        className={`overflow-x-auto overflow-y-hidden border-2 border-zinc-950 bg-[#fffcf0] p-2 shadow-[4px_4px_0_#18181b] ${className}`}
      >
        <ins
          className="adsbygoogle mx-auto"
          style={{
            display: "inline-block",
            width: "728px",
            height: "90px",
          }}
          data-ad-client={adSenseClient}
          data-ad-slot={adSenseSlot}
        />
      </aside>
    );
  }

  const content = adImage ? (
    // Plain img keeps this slot easy to replace with any hosted banner asset.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={adImage}
      alt={adText}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  ) : (
    <div className="flex h-full min-h-20 items-center justify-between gap-3 px-4 py-3 sm:min-h-24 sm:px-6">
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-black uppercase text-[#1864ab]">
          {label}
        </p>
        <p className="mt-1 text-sm font-black leading-tight tracking-normal sm:text-base">
          {adText}
        </p>
      </div>
      <div className="hidden shrink-0 border-2 border-zinc-950 bg-[#e8ff5a] px-3 py-2 font-mono text-xs font-black sm:block">
        728 x 90
      </div>
    </div>
  );

  return (
    <aside
      aria-label="広告"
      className={`overflow-hidden border-2 border-zinc-950 bg-[#fffcf0] shadow-[4px_4px_0_#18181b] ${className}`}
    >
      {adHref ? (
        <a href={adHref} target="_blank" rel="noreferrer" className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </aside>
  );
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
