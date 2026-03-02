import { Button, Heading, Section, Text, Hr } from "@react-email/components";
import { BaseEmail } from "./_base";

interface PasswordResetEmailProps {
  resetUrl: string;
  expiresInMinutes?: number;
}

export function PasswordResetEmail({
  resetUrl,
  expiresInMinutes = 60,
}: PasswordResetEmailProps) {
  return (
    <BaseEmail preview="Réinitialisation de votre mot de passe TocTocToc.boutique">
      {/* Icône */}
      <Section style={styles.iconSection}>
        <div style={styles.iconCircle}>🔑</div>
      </Section>

      {/* Titre */}
      <Heading style={styles.heading}>Mot de passe oublié ?</Heading>

      <Text style={styles.intro}>
        Nous avons reçu une demande de réinitialisation de votre mot de passe.
        Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
      </Text>

      {/* CTA principal */}
      <Section style={styles.ctaSection}>
        <Button href={resetUrl} style={styles.button}>
          Réinitialiser mon mot de passe
        </Button>
      </Section>

      <Hr style={styles.hr} />

      {/* Infos sécurité */}
      <Section style={styles.securityBox}>
        <Text style={styles.securityItem}>
          ⏱ Ce lien expire dans <strong>{expiresInMinutes} minutes</strong>
        </Text>
        <Text style={styles.securityItem}>
          🔒 Si vous n&apos;avez pas fait cette demande, ignorez cet email —
          votre mot de passe reste inchangé.
        </Text>
      </Section>

      {/* Lien texte de secours */}
      <Text style={styles.fallbackLabel}>
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
      </Text>
      <Text style={styles.fallbackUrl}>{resetUrl}</Text>
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
    display: "inline-block",
    fontSize: "28px",
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
    margin: "0 0 28px",
    textAlign: "center" as const,
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
  hr: {
    borderColor: "#f1f5f9",
    borderTopWidth: "1px",
    margin: "0 0 24px",
  },
  securityBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    padding: "16px 20px",
    marginBottom: "24px",
  },
  securityItem: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 8px",
  },
  fallbackLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    margin: "0 0 6px",
    textAlign: "center" as const,
  },
  fallbackUrl: {
    color: "#6366f1",
    fontSize: "11px",
    lineHeight: "1.4",
    margin: "0",
    textAlign: "center" as const,
    wordBreak: "break-all" as const,
  },
};
