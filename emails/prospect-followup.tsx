import { Section, Text, Link, Button } from "@react-email/components";
import { BaseEmail } from "./_base";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://toctoctoc.boutique";

interface Props {
  businessName: string;
  claimUrl: string;
  /** 1, 2, or 3 — determines the email tone */
  step: 1 | 2 | 3;
  /** Optional scan count to show social proof */
  scanCount?: number;
}

const SUBJECTS: Record<number, (name: string) => string> = {
  1: (name) => `${name} — vos supports QR sont bien arrivés ?`,
  2: (name) => `${name} — vos clients utilisent déjà vos supports`,
  3: (name) => `Dernière chance pour ${name} — votre espace gratuit expire bientôt`,
};

export function getFollowupSubject(step: 1 | 2 | 3, businessName: string): string {
  return SUBJECTS[step](businessName);
}

export function ProspectFollowupEmail({ businessName, claimUrl, step, scanCount }: Props) {
  return (
    <BaseEmail preview={SUBJECTS[step](businessName)}>
      <Section>
        <Text style={s.icon}>{step === 3 ? "⏰" : "📬"}</Text>

        <Text style={s.greeting}>
          Bonjour,
        </Text>

        {step === 1 && (
          <>
            <Text style={s.body}>
              Je vous ai envoyé la semaine dernière des <strong>supports QR code</strong> pour{" "}
              <strong>{businessName}</strong> — un pour collecter vos avis Google, et un pour la carte de fidélité.
            </Text>
            <Text style={s.body}>
              Avez-vous eu l&apos;occasion de les poser près de votre comptoir ? Il suffit de les déposer,
              vos clients font le reste.
            </Text>
            <Text style={s.body}>
              Votre <strong>espace de gestion gratuit</strong> est déjà prêt. Vous pouvez y accéder pour
              suivre vos avis et vos cartes de fidélité en un clic :
            </Text>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={s.body}>
              De bonnes nouvelles pour <strong>{businessName}</strong> !
            </Text>
            {scanCount && scanCount > 0 ? (
              <Text style={s.highlight}>
                {scanCount} personne{scanCount > 1 ? "s" : ""} {scanCount > 1 ? "ont" : "a"} déjà
                scanné vos supports cette semaine.
              </Text>
            ) : (
              <Text style={s.body}>
                Vos supports QR code sont en place — il ne manque plus qu&apos;à les rendre visibles
                pour vos clients (près de la caisse, sur le comptoir...).
              </Text>
            )}
            <Text style={s.body}>
              Accédez à votre tableau de bord gratuit pour voir vos résultats en temps réel et
              personnaliser vos récompenses :
            </Text>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={s.body}>
              C&apos;est mon dernier message à propos de l&apos;espace que j&apos;ai préparé
              pour <strong>{businessName}</strong>.
            </Text>
            <Text style={s.body}>
              Vos supports QR sont déjà configurés et prêts à l&apos;emploi. Si vous ne souhaitez pas
              les utiliser, aucun souci — je ne vous relancerai plus.
            </Text>
            <Text style={s.body}>
              Mais si vous changez d&apos;avis, votre espace gratuit reste accessible ici :
            </Text>
          </>
        )}

        <Section style={s.ctaSection}>
          <Button href={claimUrl} style={s.cta}>
            Accéder à mon espace gratuit
          </Button>
        </Section>

        <Text style={s.reassurance}>
          100% gratuit · Sans engagement · Déjà configuré pour vous
        </Text>

        <Text style={s.closing}>
          Si vous avez la moindre question, répondez simplement à cet email.
        </Text>

        <Text style={s.signature}>
          Jean-Baptiste CHAUVIN{"\n"}
          <span style={s.sigRole}>Fondateur · TocTocToc.boutique</span>
        </Text>
      </Section>
    </BaseEmail>
  );
}

const s = {
  icon: {
    fontSize: "36px",
    textAlign: "center" as const,
    margin: "0 0 16px",
  },
  greeting: {
    fontSize: "15px",
    color: "#1e293b",
    margin: "0 0 16px",
  },
  body: {
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.6",
    margin: "0 0 12px",
  },
  highlight: {
    fontSize: "15px",
    fontWeight: "700" as const,
    color: "#4f46e5",
    backgroundColor: "#eef2ff",
    padding: "12px 16px",
    borderRadius: "8px",
    margin: "0 0 12px",
    textAlign: "center" as const,
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "24px 0",
  },
  cta: {
    backgroundColor: "#4f46e5",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700" as const,
    padding: "14px 28px",
    textDecoration: "none",
  },
  reassurance: {
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center" as const,
    margin: "0 0 24px",
  },
  closing: {
    fontSize: "14px",
    color: "#475569",
    margin: "0 0 16px",
  },
  signature: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#1e293b",
    margin: "0",
    whiteSpace: "pre-line" as const,
  },
  sigRole: {
    fontSize: "13px",
    fontWeight: "400" as const,
    color: "#64748b",
  },
};
