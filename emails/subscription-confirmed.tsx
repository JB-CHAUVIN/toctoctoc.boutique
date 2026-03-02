import { Button, Heading, Section, Text, Hr } from "@react-email/components";
import { BaseEmail } from "./_base";

interface SubscriptionConfirmedEmailProps {
  name: string;
  plan: string;
  periodEnd: string;
  dashboardUrl: string;
  isTrialing?: boolean;
}

const PLAN_FEATURES: Record<string, string[]> = {
  STARTER: [
    "1 espace business",
    "Vitrine personnalisable",
    "Réservations en ligne",
    "Collecte d'avis clients",
    "Programme de fidélité",
  ],
  PRO: [
    "3 espaces business",
    "Toutes les fonctions Starter",
    "Intégrations réseaux sociaux",
    "Statistiques avancées",
    "Support prioritaire",
  ],
  ENTERPRISE: [
    "Espaces illimités",
    "Tous les modules",
    "API & webhooks",
    "Onboarding dédié",
    "Support 24/7",
  ],
};

export function SubscriptionConfirmedEmail({
  name,
  plan,
  periodEnd,
  dashboardUrl,
  isTrialing = false,
}: SubscriptionConfirmedEmailProps) {
  const features = PLAN_FEATURES[plan] ?? [];
  const planLabel = plan.charAt(0) + plan.slice(1).toLowerCase();

  return (
    <BaseEmail
      preview={`Votre abonnement ${planLabel} est activé${isTrialing ? " — essai de 14 jours" : ""} !`}
    >
      {/* Badge plan */}
      <Section style={styles.badgeSection}>
        <div style={styles.planBadge}>{planLabel}</div>
      </Section>

      {/* Titre */}
      <Heading style={styles.heading}>
        {isTrialing ? "Votre essai gratuit démarre !" : "Abonnement activé !"}
      </Heading>

      <Text style={styles.intro}>
        {isTrialing ? (
          <>
            Bonjour {name}, votre essai de 14 jours sur le plan{" "}
            <strong style={styles.accent}>{planLabel}</strong> est maintenant actif.
            Aucun paiement ne sera prélevé avant le {periodEnd}.
          </>
        ) : (
          <>
            Bonjour {name}, votre abonnement{" "}
            <strong style={styles.accent}>{planLabel}</strong> est actif jusqu&apos;au{" "}
            <strong>{periodEnd}</strong>.
          </>
        )}
      </Text>

      {/* Fonctionnalités incluses */}
      {features.length > 0 && (
        <Section style={styles.featuresBox}>
          <Text style={styles.featuresTitle}>Inclus dans votre plan {planLabel} :</Text>
          {features.map((feature) => (
            <Text key={feature} style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span> {feature}
            </Text>
          ))}
        </Section>
      )}

      <Hr style={styles.hr} />

      {/* CTA */}
      <Section style={styles.ctaSection}>
        <Button href={dashboardUrl} style={styles.button}>
          Accéder à mon dashboard →
        </Button>
      </Section>

      {isTrialing && (
        <Text style={styles.trialNote}>
          Vous pouvez annuler votre essai à tout moment depuis votre espace
          facturation sans frais.
        </Text>
      )}
    </BaseEmail>
  );
}

const styles = {
  badgeSection: {
    textAlign: "center" as const,
    marginBottom: "20px",
  },
  planBadge: {
    backgroundColor: "#ede9fe",
    borderRadius: "999px",
    color: "#4f46e5",
    display: "inline-block",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    padding: "6px 16px",
    textTransform: "uppercase" as const,
  },
  heading: {
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    lineHeight: "1.3",
    margin: "0 0 16px",
    textAlign: "center" as const,
  },
  intro: {
    color: "#475569",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 24px",
    textAlign: "center" as const,
  },
  accent: {
    color: "#4f46e5",
  },
  featuresBox: {
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    padding: "20px 24px",
    marginBottom: "24px",
  },
  featuresTitle: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 12px",
  },
  featureItem: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 6px",
  },
  checkmark: {
    color: "#6366f1",
    fontWeight: "700",
  },
  hr: {
    borderColor: "#f1f5f9",
    borderTopWidth: "1px",
    margin: "0 0 24px",
  },
  ctaSection: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "600",
    padding: "14px 32px",
    textDecoration: "none",
  },
  trialNote: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0",
    textAlign: "center" as const,
  },
};
