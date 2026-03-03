"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Loader2, CheckCircle, Send } from "lucide-react";
import toast from "react-hot-toast";

/** Top-level app routes — anything else is a business slug, so we hide the button */
const APP_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/dashboard", "/contact", "/claim"];

type FormState = { name: string; email: string; subject: string; message: string };

export function ContactButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });

  // Hide on public business pages (any path not matching a known app route)
  const isAppRoute = APP_ROUTES.some((r) => pathname === r || (r !== "/" && pathname.startsWith(r + "/")));
  if (!isAppRoute) return null;

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleOpen(subject?: string) {
    setSent(false);
    setForm({ name: "", email: "", subject: subject ?? "", message: "" });
    setOpen(true);
  }

  // Écouter les demandes d'ouverture depuis d'autres composants
  useEffect(() => {
    const handler = (e: Event) => {
      const subject = (e as CustomEvent<{ subject?: string }>).detail?.subject;
      handleOpen(subject);
    };
    window.addEventListener("open-contact-form", handler);
    return () => window.removeEventListener("open-contact-form", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Une erreur est survenue");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => handleOpen()}
        aria-label="Contactez-nous"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Contactez-nous</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Modale */}
      <div
        className={`fixed bottom-0 right-0 z-50 w-full transition-transform duration-300 ease-out sm:bottom-6 sm:right-6 sm:w-[420px] ${
          open ? "translate-y-0" : "translate-y-[110%]"
        }`}
      >
        <div className="overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-600 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Contactez-nous</p>
                <p className="text-xs text-indigo-200">Réponse sous 24h</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-indigo-200 transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-5">
            {sent ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <p className="text-base font-semibold text-slate-900">Message envoyé !</p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous vous répondrons dans les plus brefs délais à{" "}
                  <strong>{form.email}</strong>.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-5 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Nom <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={update("name")}
                      required
                      minLength={2}
                      placeholder="Jean Dupont"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      required
                      placeholder="vous@exemple.fr"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Objet</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={update("subject")}
                    placeholder="Comment puis-je vous aider ?"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={update("message")}
                    required
                    minLength={10}
                    rows={4}
                    placeholder="Décrivez votre demande..."
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {loading ? "Envoi..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
