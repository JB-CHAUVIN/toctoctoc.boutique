"use client";

import { useState } from "react";
import { Copy, Check, Settings2 } from "lucide-react";
import { ProspectLetterButton } from "./prospect-letter";

interface BusinessInfo {
  name: string;
  slug: string;
  businessType: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string | null;
  logoBackground?: string | null;
}

interface Props {
  businessId: string;
  appUrl: string;
  prospectedAt: Date | null;
  business: BusinessInfo;
  claimToken: string | null;
}

function CopyButton({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copié !" : label}
    </button>
  );
}

export function SetupPanel({
  businessId,
  appUrl,
  prospectedAt: initialProspectedAt,
  business,
  claimToken,
}: Props) {
  const [prospectedAt, setProspectedAt] = useState<Date | null>(
    initialProspectedAt,
  );
  const [loading, setLoading] = useState(false);

  async function handleToggleProspected() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/businesses/${businessId}/prospect`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prospected: !prospectedAt }),
        },
      );
      if (res.ok) {
        setProspectedAt(prospectedAt ? null : new Date());
      }
    } finally {
      setLoading(false);
    }
  }

  const reviewsUrl = `${appUrl}/${businessId}/avis`;
  const loyaltyUrl = `${appUrl}/${businessId}/fidelite`;

  return (
    <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-violet-600" />
        <h2 className="text-sm font-semibold text-violet-800">Mode Setup</h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ProspectLetterButton
          business={business}
          businessId={businessId}
          claimToken={claimToken}
          appUrl={appUrl}
        />

        <CopyButton url={reviewsUrl} label="Copier lien avis" />
        <CopyButton url={loyaltyUrl} label="Copier lien fidélité" />

        <button
          onClick={handleToggleProspected}
          disabled={loading}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition disabled:opacity-60 ${
            prospectedAt
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-violet-200 bg-white text-violet-700 hover:border-violet-300 hover:bg-violet-50"
          }`}
        >
          {prospectedAt ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Prospecté le{" "}
              {new Date(prospectedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </>
          ) : (
            <>Prospecté OK</>
          )}
        </button>
      </div>
    </div>
  );
}
