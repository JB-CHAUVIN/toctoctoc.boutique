"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Business, BusinessModule } from "@prisma/client";
import type { ModuleType } from "@prisma/client";

interface SiteNavProps {
  business: Business & { modules: BusinessModule[] };
}

const MODULE_LINKS: Partial<Record<ModuleType, { label: string; href: (slug: string) => string }>> = {
  BOOKING: { label: "Réserver", href: (s) => `/${s}/booking` },
  REVIEWS: { label: "Laisser un avis", href: (s) => `/${s}/avis` },
  LOYALTY: { label: "Ma fidélité", href: (s) => `/${s}/fidelite` },
};

export function SiteNav({ business }: SiteNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeModuleLinks = business.modules
    .filter((m) => m.isActive && MODULE_LINKS[m.module as ModuleType])
    .map((m) => MODULE_LINKS[m.module as ModuleType]!);

  const navLinks = [
    { label: "Accueil", href: `/${business.slug}` },
    ...activeModuleLinks.map((link) => ({
      label: link.label,
      href: link.href(business.slug),
    })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md" style={{ borderColor: business.primaryColor + "20" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo / Nom */}
        <Link href={`/${business.slug}`} className="flex items-center gap-3">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt={business.name} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: business.primaryColor }}
            >
              {business.name[0].toUpperCase()}
            </div>
          )}
          <span className="text-lg font-bold" style={{ color: business.primaryColor }}>
            {business.name}
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href ? "text-white" : "text-slate-600 hover:text-slate-900"
              )}
              style={pathname === link.href ? { backgroundColor: business.primaryColor } : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Contact & mobile toggle */}
        <div className="flex items-center gap-3">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="hidden md:flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
              style={{ borderColor: business.primaryColor + "40", color: business.primaryColor }}
            >
              <Phone className="h-3.5 w-3.5" />
              {business.phone}
            </a>
          )}
          <button
            className="md:hidden rounded-lg p-2 text-slate-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium",
                  pathname === link.href ? "text-white" : "text-slate-700 hover:bg-slate-50"
                )}
                style={pathname === link.href ? { backgroundColor: business.primaryColor } : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
