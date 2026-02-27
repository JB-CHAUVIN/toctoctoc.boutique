import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4">
      <Link href="/" className="mb-8 text-2xl font-bold text-indigo-600">
        LocalSaaS
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-slate-400">
        © {new Date().getFullYear()} LocalSaaS. Tous droits réservés.
      </p>
    </div>
  );
}
