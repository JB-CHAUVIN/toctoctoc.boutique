"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Une erreur est survenue");
        return;
      }

      setSent(true);
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
          <Mail className="h-6 w-6 text-indigo-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Email envoyé !</h1>
        <p className="mt-2 text-sm text-slate-500">
          Si un compte existe pour <strong>{email}</strong>, vous recevrez un
          lien de réinitialisation dans les prochaines minutes.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Pensez à vérifier vos spams.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-slate-500">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="vous@exemple.fr"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Envoi en cours..." : "Envoyer le lien"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
