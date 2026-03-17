"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, FileText, ImageDown, Loader2, Mail } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import type { PrintThemeId } from "@/lib/constants";
import { buildLetterHtml } from "../prospect-letter";
import { buildLetterV2Html } from "../prospect-letter-v2";
import {
  PrintCard,
  getThemeStyles,
  flattenBrandStyle,
} from "../printable-cards";
import { ThemeButtons } from "./theme-buttons";
import { TractPreview } from "./tract-preview";
import { SupportCardCapture, SUPPORT_CARD_W, SUPPORT_CARD_H } from "./support-card-capture";
import { SupportCardVerso } from "./support-card-verso";
import {
  hasModule,
  getCard,
  ensureClaimToken,
  generateClaimQr,
  loadImageAsBase64,
  buildCombinedTractHtml,
  markBusinessAsProspected,
} from "./helpers";
import { buildEnvelopesPrintHtml } from "./envelope-print";
import type { BusinessData, BusinessConfig, CardVariant } from "./types";

interface ConfigureExportProps {
  businesses: BusinessData[];
  configs: Record<string, BusinessConfig>;
  setConfigs: React.Dispatch<React.SetStateAction<Record<string, BusinessConfig>>>;
  appUrl: string;
  onBack: () => void;
}

export function ConfigureAndExport({
  businesses,
  configs,
  setConfigs,
  appUrl,
  onBack,
}: ConfigureExportProps) {
  const [generatingTracts, setGeneratingTracts] = useState(false);
  const [generatingZip, setGeneratingZip] = useState(false);
  const [logoB64, setLogoB64] = useState<string>();
  const [businessLogos, setBusinessLogos] = useState<Record<string, string>>({});

  // Refs for support card captures (2 per business: reviews + loyalty)
  const captureRefs = useRef<
    Record<string, { reviews: HTMLDivElement | null; loyalty: HTMLDivElement | null }>
  >({});
  const versoRefs = useRef<
    Record<string, { reviews: HTMLDivElement | null; loyalty: HTMLDivElement | null }>
  >({});

  const getRefSetter = useCallback(
    (businessId: string, type: "reviews" | "loyalty") => {
      return (el: HTMLDivElement | null) => {
        if (!captureRefs.current[businessId]) {
          captureRefs.current[businessId] = { reviews: null, loyalty: null };
        }
        captureRefs.current[businessId][type] = el;
      };
    },
    [],
  );

  const getVersoRefSetter = useCallback(
    (businessId: string, type: "reviews" | "loyalty") => {
      return (el: HTMLDivElement | null) => {
        if (!versoRefs.current[businessId]) {
          versoRefs.current[businessId] = { reviews: null, loyalty: null };
        }
        versoRefs.current[businessId][type] = el;
      };
    },
    [],
  );

  // Load logos
  useEffect(() => {
    loadImageAsBase64("/logo.png").then((b64) => b64 && setLogoB64(b64));
  }, []);

  useEffect(() => {
    businesses.forEach((b) => {
      if (b.logoUrl && !businessLogos[b.id]) {
        loadImageAsBase64(b.logoUrl).then((b64) => {
          if (b64) setBusinessLogos((prev) => ({ ...prev, [b.id]: b64 }));
        });
      }
    });
  }, [businesses, businessLogos]);

  function updateConfig(id: string, patch: Partial<BusinessConfig>) {
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function applyThemeToAll(field: "tractTheme" | "supportTheme", theme: PrintThemeId) {
    setConfigs((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        next[id] = { ...next[id], [field]: theme };
      }
      return next;
    });
  }

  async function buildTractForBusiness(business: BusinessData) {
    let token = business.claimToken;
    if (!token) token = await ensureClaimToken(business.id);

    let claimUrl: string | null = null;
    let claimQrDataUrl: string | null = null;
    if (token) {
      const qr = await generateClaimQr(appUrl, token);
      claimUrl = qr.url;
      claimQrDataUrl = qr.qrDataUrl;
    }

    const config = configs[business.id];
    return buildLetterHtml(
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
        googleRating: business.googleRating,
        googleReviewCount: business.googleReviewCount,
      },
      business.id,
      appUrl,
      claimUrl,
      claimQrDataUrl,
      config.tractTheme,
      business.brandStyle as Record<string, unknown> | null,
      config.showAvatar,
    );
  }

  async function handlePreviewTract(business: BusinessData) {
    try {
      const html = await buildTractForBusiness(business);
      const win = window.open("", "_blank", "width=900,height=1100");
      if (!win) { toast.error("Popup bloquee"); return; }
      win.document.write(html);
      win.document.close();
    } catch (err) {
      console.error("[PREVIEW-TRACT]", err);
      toast.error("Erreur lors de la previsualisation");
    }
  }

  async function handleGenerateTracts() {
    setGeneratingTracts(true);
    try {
      const pages: string[] = [];
      for (const b of businesses) pages.push(await buildTractForBusiness(b));

      const combined = buildCombinedTractHtml(pages);
      const win = window.open("", "_blank", "width=900,height=1100");
      if (!win) { toast.error("Popup bloquee - autorisez les popups"); return; }
      win.document.write(combined);
      win.document.close();
      win.focus();
      win.document.fonts.ready.then(() => setTimeout(() => win.print(), 400));

      // Mark all as prospected
      const notYet = businesses.filter((b) => !b.prospectedAt);
      await Promise.all(notYet.map((b) => markBusinessAsProspected(b.id)));
      notYet.forEach((b) => { b.prospectedAt = new Date().toISOString(); });

      toast.success(`${businesses.length} tracts generes — tous marques comme prospectes`);
    } catch (err) {
      console.error("[BATCH-TRACTS]", err);
      toast.error("Erreur lors de la generation des tracts");
    } finally {
      setGeneratingTracts(false);
    }
  }

  async function handleGenerateTractsV2() {
    setGeneratingTracts(true);
    try {
      const pages: string[] = [];
      for (const b of businesses) {
        let token = b.claimToken;
        if (!token) token = await ensureClaimToken(b.id);
        let claimUrl: string | null = null;
        let claimQrDataUrl: string | null = null;
        if (token) {
          const qr = await generateClaimQr(appUrl, token);
          claimUrl = qr.url;
          claimQrDataUrl = qr.qrDataUrl;
        }
        pages.push(buildLetterV2Html(
          { name: b.name, slug: b.slug, businessType: b.businessType, address: b.address, city: b.city, zipCode: b.zipCode, phone: b.phone, email: b.email, primaryColor: b.primaryColor, accentColor: b.accentColor, logoUrl: b.logoUrl, logoBackground: b.logoBackground, googleRating: b.googleRating, googleReviewCount: b.googleReviewCount },
          appUrl, claimUrl, claimQrDataUrl,
        ));
      }

      const combined = buildCombinedTractHtml(pages);
      const win = window.open("", "_blank", "width=600,height=850");
      if (!win) { toast.error("Popup bloquee - autorisez les popups"); return; }
      win.document.write(combined);
      win.document.close();
      win.focus();
      win.document.fonts.ready.then(() => setTimeout(() => win.print(), 400));

      const notYet = businesses.filter((b) => !b.prospectedAt);
      await Promise.all(notYet.map((b) => markBusinessAsProspected(b.id)));
      notYet.forEach((b) => { b.prospectedAt = new Date().toISOString(); });

      toast.success(`${businesses.length} tracts V2 (A5) generes`);
    } catch (err) {
      console.error("[BATCH-TRACTS-V2]", err);
      toast.error("Erreur lors de la generation des tracts V2");
    } finally {
      setGeneratingTracts(false);
    }
  }

  async function handleGeneratePdfs() {
    setGeneratingZip(true);
    try {
      // Wait for QR codes & images to render in hidden captures
      await new Promise((r) => setTimeout(r, 1500));

      const captureOpts = {
        pixelRatio: 2,
        width: SUPPORT_CARD_W,
        height: SUPPORT_CARD_H,
        cacheBust: true,
        skipAutoScale: true,
        style: { position: "static", left: "0", top: "0" },
      };

      // Card is 300x300px at 2x → physical ~93mm square. Use 100x100mm page.
      const PAGE_W_MM = 100;
      const PAGE_H_MM = 100;

      const rectoImages: string[] = [];
      const versoImages: string[] = [];

      for (const business of businesses) {
        const refs = captureRefs.current[business.id];
        const vRefs = versoRefs.current[business.id];
        if (!refs) continue;

        for (const type of ["reviews", "loyalty"] as const) {
          const modType = type === "reviews" ? "REVIEWS" : "LOYALTY";
          if (!hasModule(business, modType) || !refs[type]) continue;

          const rectoPng = await toPng(refs[type]!, captureOpts);
          rectoImages.push(rectoPng);

          if (vRefs?.[type]) {
            const versoPng = await toPng(vRefs[type]!, captureOpts);
            versoImages.push(versoPng);
          }
        }
      }

      const buildPdf = (images: string[], filename: string) => {
        if (images.length === 0) return;
        const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [PAGE_W_MM, PAGE_H_MM] });
        images.forEach((img, i) => {
          if (i > 0) pdf.addPage([PAGE_W_MM, PAGE_H_MM], "landscape");
          pdf.addImage(img, "PNG", 0, 0, PAGE_W_MM, PAGE_H_MM);
        });
        pdf.save(filename);
      };

      const dateSuffix = new Date().toISOString().slice(0, 10);
      buildPdf(rectoImages, `supports-recto-${dateSuffix}.pdf`);
      // Verso en ordre inverse pour impression recto-verso (la pile est retournée)
      buildPdf([...versoImages].reverse(), `supports-verso-${dateSuffix}.pdf`);

      toast.success("PDFs des supports telecharges");
    } catch (err) {
      console.error("[BATCH-PDF]", err);
      toast.error("Erreur lors de la generation des PDFs");
    } finally {
      setGeneratingZip(false);
    }
  }

  function handlePrintEnvelopes() {
    const withAddress = businesses.filter((b) => b.address || b.city);
    if (withAddress.length === 0) {
      toast.error("Aucun commerce n'a d'adresse renseignée");
      return;
    }
    const html = buildEnvelopesPrintHtml(withAddress, logoB64);
    const win = window.open("", "_blank", "width=900,height=500");
    if (!win) { toast.error("Popup bloquée — autorisez les popups"); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.document.fonts.ready.then(() => setTimeout(() => win.print(), 300));
    toast.success(`${withAddress.length} enveloppe${withAddress.length > 1 ? "s" : ""} DL générée${withAddress.length > 1 ? "s" : ""}`);
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Configuration ({businesses.length} entreprise{businesses.length > 1 ? "s" : ""})
          </h1>
          <p className="text-sm text-slate-500">
            Configurez le theme de chaque tract et support, puis exportez tout.
          </p>
        </div>
      </div>

      {/* Bulk theme selector */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <span className="text-sm font-medium text-slate-700">Appliquer a tous :</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Tracts :</span>
          <ThemeButtons value="gradient" onChange={(t) => applyThemeToAll("tractTheme", t)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Supports :</span>
          <ThemeButtons value="gradient" onChange={(t) => applyThemeToAll("supportTheme", t)} />
        </div>
      </div>

      {/* Business cards */}
      <div className="space-y-4">
        {businesses.map((b) => {
          const config = configs[b.id];
          const bHasReviews = hasModule(b, "REVIEWS");
          const bHasLoyalty = hasModule(b, "LOYALTY");
          const normalizedBs = flattenBrandStyle(b.brandStyle);
          const bHasLogo = !!b.logoUrl;
          const supportThemeStyles = getThemeStyles(
            config.supportTheme, b.primaryColor, b.secondaryColor, b.accentColor, normalizedBs,
          );

          return (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <BusinessCardHeader business={b} bHasReviews={bHasReviews} bHasLoyalty={bHasLoyalty} />

              {/* Options */}
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">Theme tract</p>
                  <ThemeButtons value={config.tractTheme} onChange={(t) => updateConfig(b.id, { tractTheme: t })} hasLogo={bHasLogo} />
                </div>
                {(bHasReviews || bHasLoyalty) && (
                  <div>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">Theme support</p>
                    <ThemeButtons value={config.supportTheme} onChange={(t) => updateConfig(b.id, { supportTheme: t })} hasLogo={bHasLogo} />
                  </div>
                )}
                {(bHasReviews || bHasLoyalty) && (
                  <div>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">Variante carte</p>
                    <CardVariantButtons value={config.cardVariant} onChange={(v) => updateConfig(b.id, { cardVariant: v })} />
                  </div>
                )}
              </div>

              {/* Avatar toggle + logo scale */}
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => updateConfig(b.id, { showAvatar: !config.showAvatar })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${config.showAvatar ? "bg-indigo-600" : "bg-slate-200"}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${config.showAvatar ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                  </button>
                  Avatar du commerce
                </label>
                {bHasLogo && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-400">Logo</span>
                    <input
                      type="range"
                      min="0.3"
                      max="2"
                      step="0.1"
                      value={config.logoScale ?? 1}
                      onChange={(e) => updateConfig(b.id, { logoScale: parseFloat(e.target.value) })}
                      className="h-1 w-20 cursor-pointer accent-indigo-600"
                    />
                    <span className="w-8 text-[10px] font-medium text-slate-500">{((config.logoScale ?? 1) * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>

              {/* Previews: tract + support cards */}
              <div className="mt-3 flex gap-3 overflow-x-auto">
                <TractPreview
                  business={b}
                  appUrl={appUrl}
                  theme={config.tractTheme}
                  showAvatar={config.showAvatar}
                  onOpenFullPreview={() => handlePreviewTract(b)}
                />
                {bHasReviews && (
                  <SupportPreviewMini
                    label="Avis"
                    card={getCard("reviews", config.cardVariant)}
                    business={b}
                    themeStyles={supportThemeStyles}
                    showAvatar={config.showAvatar}
                    logoB64={logoB64}
                    businessLogoB64={businessLogos[b.id]}
                    logoScale={config.logoScale ?? 1}
                    theme={config.supportTheme}
                  />
                )}
                {bHasLoyalty && (
                  <SupportPreviewMini
                    label="Fidelite"
                    card={getCard("loyalty", config.cardVariant)}
                    business={b}
                    themeStyles={supportThemeStyles}
                    showAvatar={config.showAvatar}
                    logoB64={logoB64}
                    businessLogoB64={businessLogos[b.id]}
                    logoScale={config.logoScale ?? 1}
                    theme={config.supportTheme}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden capture refs for ZIP export */}
      {businesses.map((b) => {
        const config = configs[b.id];
        const normalizedBs = flattenBrandStyle(b.brandStyle);
        const supportThemeStyles = getThemeStyles(
          config.supportTheme, b.primaryColor, b.secondaryColor, b.accentColor, normalizedBs,
        );
        return (
          <div key={`capture-${b.id}`}>
            {hasModule(b, "REVIEWS") && (
              <>
                <SupportCardCapture business={b} appUrl={appUrl} themeStyles={supportThemeStyles} showAvatar={config.showAvatar} logoB64={logoB64} businessLogoB64={businessLogos[b.id]} refSetter={getRefSetter(b.id, "reviews")} cardType="reviews" cardVariant={config.cardVariant} logoScale={config.logoScale ?? 1} theme={config.supportTheme} />
                <SupportCardVerso businessName={b.name} cardType="reviews" refSetter={getVersoRefSetter(b.id, "reviews")} />
              </>
            )}
            {hasModule(b, "LOYALTY") && (
              <>
                <SupportCardCapture business={b} appUrl={appUrl} themeStyles={supportThemeStyles} showAvatar={config.showAvatar} logoB64={logoB64} businessLogoB64={businessLogos[b.id]} refSetter={getRefSetter(b.id, "loyalty")} cardType="loyalty" cardVariant={config.cardVariant} logoScale={config.logoScale ?? 1} theme={config.supportTheme} />
                <SupportCardVerso businessName={b.name} cardType="loyalty" refSetter={getVersoRefSetter(b.id, "loyalty")} />
              </>
            )}
          </div>
        );
      })}

      {/* Export actions (sticky bottom) */}
      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <button
          onClick={handleGenerateTractsV2}
          disabled={generatingTracts}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {generatingTracts ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {generatingTracts ? "Generation..." : `V2 A5 (${businesses.length})`}
        </button>
        <button
          onClick={handleGenerateTracts}
          disabled={generatingTracts}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
        >
          {generatingTracts ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {generatingTracts ? "Generation..." : `V1 A4 (${businesses.length})`}
        </button>
        <button
          onClick={handleGeneratePdfs}
          disabled={generatingZip}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {generatingZip ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
          {generatingZip ? "Generation..." : "Telecharger supports (.pdf)"}
        </button>
        <button
          onClick={handlePrintEnvelopes}
          className="flex items-center gap-2 rounded-lg bg-slate-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
        >
          <Mail className="h-4 w-4" />
          Enveloppes DL
        </button>
        <span className="text-xs text-slate-400">
          Les tracts s&apos;impriment via la boite de dialogue du navigateur. Les supports sont telecharges en 2 PDFs (recto + verso).
        </span>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function BusinessCardHeader({
  business: b,
  bHasReviews,
  bHasLoyalty,
}: {
  business: BusinessData;
  bHasReviews: boolean;
  bHasLoyalty: boolean;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      {b.logoUrl ? (
        <img src={b.logoUrl} alt="" className="h-8 w-8 flex-shrink-0 rounded object-contain p-0.5" style={{ backgroundColor: b.logoBackground || b.primaryColor }} />
      ) : (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-white" style={{ backgroundColor: b.primaryColor }}>
          {b.name[0]?.toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{b.name}</p>
        <p className="text-xs text-slate-400">{[b.address, b.city].filter(Boolean).join(", ")}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {bHasReviews && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Avis</span>}
        {bHasLoyalty && <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">Fidelite</span>}
      </div>
    </div>
  );
}

function SupportPreviewMini({
  label,
  card,
  business: b,
  themeStyles,
  showAvatar,
  logoB64,
  businessLogoB64,
  logoScale = 1,
  theme,
}: {
  label: string;
  card: import("../printable-cards").CardDef;
  business: BusinessData;
  themeStyles: ReturnType<typeof getThemeStyles>;
  showAvatar: boolean;
  logoB64?: string;
  businessLogoB64?: string;
  logoScale?: number;
  theme?: import("@/lib/constants").PrintThemeId;
}) {
  return (
    <div className="flex-shrink-0">
      <p className="mb-1 text-[10px] text-slate-400">{label}</p>
      <div className="overflow-hidden rounded-lg" style={{ width: 100, height: 100 }}>
        <div style={{ transform: "scale(0.333)", transformOrigin: "top left" }}>
          <PrintCard
            card={card}
            businessName={b.name}
            primaryColor={b.primaryColor}
            secondaryColor={b.secondaryColor}
            accentColor={b.accentColor}
            qrDataUrl=""
            logoB64={logoB64}
            businessLogoB64={businessLogoB64}
            businessLogoUrl={b.logoUrl ?? undefined}
            logoBackground={b.logoBackground ?? undefined}
            cardW={SUPPORT_CARD_W}
            cardH={SUPPORT_CARD_H}
            themeStyles={themeStyles}
            showAvatar={showAvatar}
            logoScale={logoScale}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}

const CARD_VARIANTS: { id: CardVariant; label: string }[] = [
  { id: "qr", label: "QR Code" },
  { id: "nfc", label: "QR + NFC" },
];

function CardVariantButtons({ value, onChange }: { value: CardVariant; onChange: (v: CardVariant) => void }) {
  return (
    <div className="flex gap-1">
      {CARD_VARIANTS.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
            value === v.id
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
