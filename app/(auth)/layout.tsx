import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4">
      <Link href="/" className="mb-8 flex flex-col items-center gap-2">
        <Image src="/logo.png" alt="TocTocToc.boutique" width={56} height={56} priority />
        <span className="text-xl font-bold text-indigo-600">TocTocToc.boutique</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-slate-400">
        © {new Date().getFullYear()} TocTocToc.boutique. Tous droits réservés.
      </p>
    </div>
  );
}
