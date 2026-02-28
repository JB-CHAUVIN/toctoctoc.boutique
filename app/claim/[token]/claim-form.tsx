"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  token: string;
  businessName: string;
}

export function ClaimForm({ token, businessName }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/claim/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">🎉</div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Bienvenue, votre compte est créé !
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Votre espace <strong>{businessName}</strong> vous attend. Connectez-vous maintenant pour
          le configurer.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          Se connecter à mon espace
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Votre adresse email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.fr"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Choisissez un mot de passe
        </label>
        <div className="relative">
          <input
            type={showPwd ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Confirmez le mot de passe
        </label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Répétez le mot de passe"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Activer mon espace
      </button>
    </form>
  );
}
