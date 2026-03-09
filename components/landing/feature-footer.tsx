import Link from "next/link";

export function FeatureFooter() {
  return (
    <footer className="border-t border-slate-100 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-indigo-600">Accueil</Link>
          <Link href="/fonctionnalites/avis-google" className="hover:text-indigo-600">Avis Google</Link>
          <Link href="/fonctionnalites/carte-de-fidelite" className="hover:text-indigo-600">Carte de fidélité</Link>
          <Link href="/fonctionnalites/site-vitrine" className="hover:text-indigo-600">Site vitrine</Link>
          <Link href="/contact" className="hover:text-indigo-600">Contact</Link>
        </div>
        <div className="mt-4 text-center text-xs text-slate-300">
          © {new Date().getFullYear()} TocTocToc.boutique · Fait avec soin en France
        </div>
      </div>
    </footer>
  );
}
