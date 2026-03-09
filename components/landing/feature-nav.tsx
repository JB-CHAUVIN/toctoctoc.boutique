import Link from "next/link";
import Image from "next/image";

export function FeatureNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="TocTocToc.boutique" width={32} height={32} />
          <span className="font-brand hidden text-xl font-bold text-indigo-600 sm:inline">
            TocTocToc.boutique
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-slate-600 hover:text-slate-900 sm:inline">
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Essai gratuit
          </Link>
        </div>
      </div>
    </nav>
  );
}
