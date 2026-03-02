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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ContactButton />
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: 500,
              padding: "14px 16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.07)",
              maxWidth: "380px",
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            },
            success: {
              duration: 3500,
              style: {
                borderLeft: "4px solid #22c55e",
              },
              iconTheme: {
                primary: "#22c55e",
                secondary: "#ffffff",
              },
            },
            error: {
              duration: 5000,
              style: {
                borderLeft: "4px solid #ef4444",
              },
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
            loading: {
              style: {
                borderLeft: "4px solid #6366f1",
              },
              iconTheme: {
                primary: "#6366f1",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
