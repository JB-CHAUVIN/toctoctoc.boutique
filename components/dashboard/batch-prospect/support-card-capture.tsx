"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  PrintCard,
  REVIEW_CARDS,
  LOYALTY_CARDS,
  type BrandStyleData,
} from "../printable-cards";
import type { BusinessData } from "./types";

const SUPPORT_CARD_W = 300;
const SUPPORT_CARD_H = 300;

export { SUPPORT_CARD_W, SUPPORT_CARD_H };

interface SupportCardCaptureProps {
  business: BusinessData;
  appUrl: string;
  themeStyles: ReturnType<typeof import("../printable-cards").getThemeStyles>;
  brandStyle: BrandStyleData | null;
  showAvatar: boolean;
  logoB64?: string;
  businessLogoB64?: string;
  refSetter: (el: HTMLDivElement | null) => void;
  cardType: "reviews" | "loyalty";
}

export function SupportCardCapture({
  business,
  appUrl,
  themeStyles,
  brandStyle,
  showAvatar,
  logoB64,
  businessLogoB64,
  refSetter,
  cardType,
}: SupportCardCaptureProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  const url =
    cardType === "reviews"
      ? `${appUrl}/${business.id}/avis`
      : `${appUrl}/${business.id}/fidelite`;

  const card = cardType === "reviews" ? REVIEW_CARDS[1] : LOYALTY_CARDS[1];

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
        brandStyle={brandStyle}
        showAvatar={showAvatar}
      />
    </div>
  );
}
