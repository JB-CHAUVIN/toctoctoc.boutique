"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { PrintCard } from "../printable-cards";
import type { PrintThemeId } from "@/lib/constants";
import { getCard } from "./helpers";
import type { BusinessData, CardVariant } from "./types";

const SUPPORT_CARD_W = 300;
const SUPPORT_CARD_H = 300;

export { SUPPORT_CARD_W, SUPPORT_CARD_H };

interface SupportCardCaptureProps {
  business: BusinessData;
  appUrl: string;
  themeStyles: ReturnType<typeof import("../printable-cards").getThemeStyles>;
  showAvatar: boolean;
  logoB64?: string;
  businessLogoB64?: string;
  refSetter: (el: HTMLDivElement | null) => void;
  cardType: "reviews" | "loyalty";
  cardVariant: CardVariant;
  logoScale?: number;
  theme?: PrintThemeId;
}

export function SupportCardCapture({
  business,
  appUrl,
  themeStyles,
  showAvatar,
  logoB64,
  businessLogoB64,
  refSetter,
  cardType,
  cardVariant,
  logoScale = 1,
  theme,
}: SupportCardCaptureProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  const url =
    cardType === "reviews"
      ? `${appUrl}/${business.id}/avis`
      : `${appUrl}/${business.id}/fidelite`;

  const card = getCard(cardType, cardVariant);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 600,
      margin: 1,
      color: { dark: "#1e293b", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [url]);

  return (
    <div
      ref={refSetter}
      style={{
        position: "absolute",
        left: -99999,
        top: 0,
        width: SUPPORT_CARD_W,
        height: SUPPORT_CARD_H,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden
    >
      <PrintCard
        card={card}
        businessName={business.name}
        primaryColor={business.primaryColor}
        secondaryColor={business.secondaryColor}
        accentColor={business.accentColor}
        qrDataUrl={qrDataUrl}
        logoB64={logoB64}
        businessLogoB64={businessLogoB64}
        businessLogoUrl={business.logoUrl ?? undefined}
        logoBackground={business.logoBackground ?? undefined}
        cardW={SUPPORT_CARD_W}
        cardH={SUPPORT_CARD_H}
        themeStyles={themeStyles}
        showAvatar={showAvatar}
        logoScale={logoScale}
        theme={theme}
      />
    </div>
  );
}
