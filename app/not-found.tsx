import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-6">
      <div className="mb-4 text-8xl font-black text-slate-100">404</div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Page introuvable</h1>
      <p className="mb-8 text-slate-500">
        {"La page que vous recherchez n'existe pas ou a été déplacée."}
      </p>
      <Link
        href="/"
        className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        {"Retour à l'accueil"}
      </Link>
    </div>
  );
}
