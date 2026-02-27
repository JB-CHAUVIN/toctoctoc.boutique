"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'inscription");
        return;
      }

      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      toast.success("Compte créé avec succès !");
      router.push("/dashboard");
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
        <p className="mt-1 text-sm text-slate-500">Commencez gratuitement, sans carte bancaire</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          { id: "name", label: "Nom complet", type: "text", placeholder: "Jean Dupont", field: "name" as const },
          { id: "email", label: "Email", type: "email", placeholder: "vous@exemple.fr", field: "email" as const },
          { id: "password", label: "Mot de passe", type: "password", placeholder: "••••••••", field: "password" as const },
          { id: "confirm", label: "Confirmer le mot de passe", type: "password", placeholder: "••••••••", field: "confirm" as const },
        ].map(({ id, label, type, placeholder, field }) => (
          <div key={id}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
              {label}
            </label>
            <input
              id={id}
              type={type}
              value={form[field]}
              onChange={update(field)}
              required
              placeholder={placeholder}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        En créant un compte, vous acceptez nos{" "}
        <span className="text-indigo-600 hover:underline cursor-pointer">CGU</span> et notre{" "}
        <span className="text-indigo-600 hover:underline cursor-pointer">politique de confidentialité</span>.
      </p>

      <p className="mt-4 text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
