import { Button, Column, Heading, Row, Section, Text } from "@react-email/components";
import { BaseEmail } from "./_base";

interface ClaimSuccessEmailProps {
  businessName: string;
  email: string;
  dashboardUrl: string;
  upgradePlanUrl: string;
  promoCode?: string | null;
}

export function ClaimSuccessEmail({
  businessName,
  email,
  dashboardUrl,
  upgradePlanUrl,
  promoCode,
}: ClaimSuccessEmailProps) {
  return (
    <BaseEmail
      preview={`Votre espace "${businessName}" a été revendiqué avec succès !`}
    >
      {/* Icône */}
      <Section style={styles.iconSection}>
        <div style={styles.iconCircle}>🏪</div>
      </Section>

      {/* Titre */}
      <Heading style={styles.heading}>Espace revendiqué !</Heading>

      <Text style={styles.intro}>
        Félicitations ! Vous êtes maintenant propriétaire de l&apos;espace{" "}
        <strong style={styles.businessName}>{businessName}</strong> sur
        TocTocToc.boutique.
      </Text>

      {/* Récap */}
      <Section style={styles.infoBox}>
        <Row style={styles.infoRow}>
          <Column style={styles.infoLabel}>Espace</Column>
          <Column style={styles.infoValue}>{businessName}</Column>
        </Row>
        <Row style={styles.infoRow}>
          <Column style={styles.infoLabel}>Compte</Column>
          <Column style={styles.infoValue}>{email}</Column>
        </Row>
        <Row style={styles.infoRow}>
          <Column style={styles.infoLabel}>Plan actuel</Column>
          <Column style={styles.infoValueRight}>
            <span style={styles.planBadge}>Gratuit (démo)</span>
          </Column>
        </Row>
      </Section>

      {/* Bandeau démo */}
      <Section style={styles.demoBox}>
        <Text style={styles.demoTitle}>⚠️ Vous êtes en mode démo</Text>
        <Text style={styles.demoText}>
          Votre compte est actuellement sur le <strong>plan gratuit</strong>.
          Certaines fonctionnalités sont limitées :
        </Text>
        <Text style={styles.demoLimit}>— Prise de rendez-vous en ligne : non disponible</Text>
        <Text style={styles.demoLimit}>— Avis clients : 3 avis maximum</Text>
        <Text style={styles.demoLimit}>— Cartes de fidélité : 3 cartes maximum</Text>
        <Text style={styles.demoUpgrade}>
          Passez au plan <strong>Starter à 9 €/mois</strong> pour lever toutes
          les limites et activer la prise de rendez-vous en ligne.
        </Text>
      </Section>

      {/* Bloc code promo */}
      {promoCode && (
        <Section style={styles.promoBox}>
          <Text style={styles.promoIcon}>🎁</Text>
          <Text style={styles.promoTitle}>Un cadeau rien que pour vous !</Text>
          <Text style={styles.promoSubtitle}>
            Ce code a été créé spécialement pour{" "}
            <strong>{businessName}</strong>
          </Text>
          <Section style={styles.promoCodeBox}>
            <Text style={styles.promoCode}>{promoCode}</Text>
          </Section>
          <Text style={styles.promoDiscount}>-40% sur votre premier abonnement</Text>
          <Button href={upgradePlanUrl} style={styles.promoButton}>
            Utiliser mon code →
          </Button>
        </Section>
      )}

      {/* CTA principal */}
      <Section style={styles.ctaSection}>
        <Button href={dashboardUrl} style={styles.button}>
          Gérer mon espace →
        </Button>
      </Section>

      {/* CTA secondaire upgrade */}
      <Section style={styles.ctaSection}>
        <Button href={upgradePlanUrl} style={styles.buttonUpgrade}>
          Passer au plan Starter — 9 €/mois
        </Button>
      </Section>

      <Text style={styles.footer}>
        Pensez à compléter votre profil et à personnaliser votre vitrine pour
        attirer vos premiers clients.
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
    display: "inline-block",
    fontSize: "32px",
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
  businessName: {
    color: "#4f46e5",
  },
  infoBox: {
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    padding: "20px 24px",
    marginBottom: "20px",
  },
  infoRow: {
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 8px",
  },
  infoLabel: {
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "500",
    padding: "3px 0",
    width: "50%",
  },
  infoValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "600",
    padding: "3px 0",
    textAlign: "right" as const,
    width: "50%",
  },
  infoValueRight: {
    textAlign: "right" as const,
    width: "50%",
  },
  planBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: "4px",
    color: "#92400e",
    fontSize: "12px",
    fontWeight: "600",
    padding: "2px 8px",
  },
  demoBox: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "20px 24px",
    marginBottom: "28px",
  },
  demoTitle: {
    color: "#92400e",
    fontSize: "15px",
    fontWeight: "700",
    margin: "0 0 8px",
  },
  demoText: {
    color: "#78350f",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 10px",
  },
  demoLimit: {
    color: "#92400e",
    fontSize: "13px",
    lineHeight: "1.6",
    margin: "0 0 2px",
  },
  demoUpgrade: {
    color: "#78350f",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "14px 0 0",
  },
  promoBox: {
    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    borderRadius: "12px",
    padding: "28px 24px",
    marginBottom: "28px",
    textAlign: "center" as const,
  },
  promoIcon: {
    fontSize: "36px",
    margin: "0 0 8px",
    textAlign: "center" as const,
  },
  promoTitle: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 6px",
    textAlign: "center" as const,
  },
  promoSubtitle: {
    color: "#e0d4fc",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 16px",
    textAlign: "center" as const,
  },
  promoCodeBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "2px dashed rgba(255,255,255,0.5)",
    borderRadius: "8px",
    padding: "12px 20px",
    marginBottom: "12px",
    textAlign: "center" as const,
  },
  promoCode: {
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: "800",
    letterSpacing: "3px",
    margin: "0",
    textAlign: "center" as const,
  },
  promoDiscount: {
    color: "#fde68a",
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 16px",
    textAlign: "center" as const,
  },
  promoButton: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    color: "#4f46e5",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "700",
    padding: "12px 28px",
    textDecoration: "none",
  },
  ctaSection: {
    textAlign: "center" as const,
    marginBottom: "12px",
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
  buttonUpgrade: {
    backgroundColor: "#ffffff",
    border: "2px solid #4f46e5",
    borderRadius: "8px",
    color: "#4f46e5",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 28px",
    textDecoration: "none",
  },
  footer: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "16px 0 0",
    textAlign: "center" as const,
  },
};
