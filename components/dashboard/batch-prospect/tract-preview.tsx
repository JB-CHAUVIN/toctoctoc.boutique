"use client";

import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import type { PrintThemeId } from "@/lib/constants";
import { buildLetterHtml } from "../prospect-letter";
import { ensureClaimToken, generateClaimQr } from "./helpers";
import type { BusinessData } from "./types";

interface TractPreviewProps {
  business: BusinessData;
  appUrl: string;
  theme: PrintThemeId;
  showAvatar: boolean;
  onOpenFullPreview: () => void;
}

export function TractPreview({
  business,
  appUrl,
  theme,
  showAvatar,
  onOpenFullPreview,
}: TractPreviewProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      let token = business.claimToken;
      if (!token) token = await ensureClaimToken(business.id);

      let claimUrl: string | null = null;
      let claimQrDataUrl: string | null = null;
      if (token) {
        const qr = await generateClaimQr(appUrl, token);
        claimUrl = qr.url;
        claimQrDataUrl = qr.qrDataUrl;
      }

      const result = buildLetterHtml(
        {
          name: business.name,
          slug: business.slug,
          businessType: business.businessType,
          address: business.address,
          city: business.city,
          zipCode: business.zipCode,
          phone: business.phone,
          email: business.email,
          primaryColor: business.primaryColor,
          accentColor: business.accentColor,
          logoUrl: business.logoUrl,
          logoBackground: business.logoBackground,
        },
        business.id,
        appUrl,
        claimUrl,
        claimQrDataUrl,
        theme,
        business.brandStyle as Record<string, unknown> | null,
        showAvatar,
      );

      if (!cancelled) setHtml(result);
    }

    generate();
    return () => { cancelled = true; };
  }, [business, appUrl, theme, showAvatar]);

  if (!html) {
    return (
      <div className="flex h-[180px] w-[127px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
        <span className="text-[10px] text-slate-400">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="group relative">
      <p className="mb-1 text-[10px] text-slate-400">Tract (page 1)</p>
      <div
        className="relative cursor-pointer overflow-hidden rounded-lg border border-slate-200 shadow-sm transition hover:shadow-md"
        style={{ width: 127, height: 180 }}
        onClick={onOpenFullPreview}
      >
        <iframe
          srcDoc={html}
          title={`Tract ${business.name}`}
          style={{
            width: 794, // A4 width in px at 96dpi
            height: 1123, // A4 height
            transform: "scale(0.16)",
            transformOrigin: "top left",
            pointerEvents: "none",
            border: "none",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/10">
          <Maximize2 className="h-4 w-4 text-white opacity-0 drop-shadow transition group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}
