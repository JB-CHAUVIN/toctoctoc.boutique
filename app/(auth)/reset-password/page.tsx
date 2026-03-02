"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center">
        <p className="text-sm text-slate-500">Lien invalide ou expiré.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline">
          Faire une nouvelle demande
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Une erreur est survenue");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Mot de passe mis à jour !</h1>
        <p className="mt-2 text-sm text-slate-500">
          Vous allez être redirigé vers la page de connexion...
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          Se connecter maintenant
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choisissez un mot de passe d&apos;au moins 8 caractères
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-10 text-sm outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && password.length < 8 && (
            <p className="mt-1 text-xs text-red-500">Au moins 8 caractères requis</p>
          )}
        </div>

        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
          />
          {confirm.length > 0 && password !== confirm && (
            <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
