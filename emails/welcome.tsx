import { Button, Heading, Section, Text } from "@react-email/components";
import { BaseEmail } from "./_base";

interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  return (
    <BaseEmail preview={`Bienvenue sur TocTocToc.boutique, ${name} !`}>
      {/* Icône */}
      <Section style={styles.iconSection}>
        <div style={styles.iconCircle}>✓</div>
      </Section>

      {/* Titre */}
      <Heading style={styles.heading}>Bienvenue, {name} !</Heading>

      <Text style={styles.intro}>
        Votre compte a été créé avec succès. Vous pouvez dès maintenant créer
        votre premier espace business et commencer à développer votre présence
        en ligne.
      </Text>

      {/* Ce que vous pouvez faire */}
      <Section style={styles.featuresBox}>
        <Text style={styles.featuresTitle}>Avec TocTocToc.boutique, vous pouvez :</Text>
        <Text style={styles.featureItem}>📍 &nbsp;Créer votre vitrine personnalisée</Text>
        <Text style={styles.featureItem}>📅 &nbsp;Gérer vos réservations en ligne</Text>
        <Text style={styles.featureItem}>⭐ &nbsp;Collecter des avis clients</Text>
        <Text style={styles.featureItem}>🎁 &nbsp;Mettre en place un programme de fidélité</Text>
      </Section>

      {/* CTA */}
      <Section style={styles.ctaSection}>
        <Button href={dashboardUrl} style={styles.button}>
          Accéder à mon dashboard →
        </Button>
      </Section>

      <Text style={styles.footer}>
        Des questions ? Répondez directement à cet email, nous sommes là pour
        vous aider.
      </Text>
    </BaseEmail>
  );
}

const styles = {
  iconSection: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  iconCircle: {
    backgroundColor: "#ede9fe",
    borderRadius: "50%",
    color: "#6366f1",
    display: "inline-block",
    fontSize: "28px",
    fontWeight: "700",
    height: "64px",
    lineHeight: "64px",
    textAlign: "center" as const,
    width: "64px",
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
  featuresBox: {
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    padding: "20px 24px",
    marginBottom: "28px",
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
  ctaSection: {
    textAlign: "center" as const,
    marginBottom: "28px",
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
  footer: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0",
    textAlign: "center" as const,
  },
};
