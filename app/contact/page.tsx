"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

const SUBJECTS = [
  "Aide pour trouver mon lien Google Avis",
  "Problème technique",
  "Question sur mon abonnement",
  "Demande de fonctionnalité",
  "Autre",
];

function ContactForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = searchParams.get("subject");
    if (s === "aide-google-avis") {
      setForm((f) => ({ ...f, subject: SUBJECTS[0] }));
    }
  }, [searchParams]);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Message envoyé !</h2>
        <p className="max-w-sm text-sm text-slate-500">
          Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais à{" "}
          <strong>{form.email}</strong>.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Votre nom *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={update("name")}
            placeholder="Marie Dupont"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            placeholder="vous@exemple.fr"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Sujet</label>
        <select
          value={form.subject}
          onChange={update("subject")}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
        >
          <option value="">Choisissez un sujet...</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Message *</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={update("message")}
          placeholder="Décrivez votre demande en détail..."
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Envoyer le message
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="TocTocToc.boutique" width={28} height={28} />
            <span className="text-base font-bold text-indigo-600">TocTocToc.boutique</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 transition">
            ← Tableau de bord
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-lg px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Nous contacter</h1>
          <p className="mt-2 text-sm text-slate-500">
            Une question ? Un problème ? Notre équipe vous répond rapidement.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Suspense>
            <ContactForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Vous pouvez aussi écrire directement à{" "}
          <a href="mailto:contact@toctoctoc.boutique" className="text-indigo-500 hover:underline">
            contact@toctoctoc.boutique
          </a>
        </p>
      </div>
    </div>
  );
}
