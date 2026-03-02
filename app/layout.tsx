import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { ContactButton } from "@/components/contact-button";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TocTocToc.boutique — Digitalisez votre commerce local",
    template: "%s | TocTocToc.boutique",
  },
  description:
    "Plateforme SaaS tout-en-un pour les commerces locaux : réservations, avis, fidélité, site vitrine.",
  keywords: ["commerce local", "réservation", "fidélité", "avis google", "site vitrine"],
  authors: [{ name: "TocTocToc.boutique" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "TocTocToc.boutique",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ContactButton />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
