"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function FreeDemoBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-100"
      >
        <span>🎁</span>
        Démo gratuite
      </button>

      {open && (
        <>
          {/* Overlay pour fermer */}
          <div className="fixed inset-0" onClick={() => setOpen(false)} />

          {/* Popover */}
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-100 bg-white p-5 shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-slate-300 hover:text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="mb-1 text-sm font-semibold text-slate-800">
              🎁 Version gratuite
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              Ce commerce utilise la version gratuite de{" "}
              <strong className="text-slate-700">TocTocToc.boutique</strong>.
              Les fonctionnalités <strong>Avis Google</strong> et{" "}
              <strong>Carte de fidélité</strong> sont limitées à{" "}
              <strong>3 utilisateurs</strong> en mode démo.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Pour profiter de toutes les fonctionnalités sans limite, le
              propriétaire peut souscrire à un abonnement à partir de{" "}
              <strong className="text-slate-700">9€/mois</strong>.
            </p>
            <a
              href="https://toctoctoc.boutique"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-lg bg-indigo-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-indigo-700"
            >
              En savoir plus →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
