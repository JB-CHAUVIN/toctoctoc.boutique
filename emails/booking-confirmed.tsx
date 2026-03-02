import { Button, Column, Heading, Hr, Row, Section, Text } from "@react-email/components";
import { BaseEmail } from "./_base";

interface BookingConfirmedEmailProps {
  customerName: string;
  businessName: string;
  serviceName?: string | null;
  date: string;
  time: string;
  address?: string | null;
  businessUrl?: string;
}

export function BookingConfirmedEmail({
  customerName,
  businessName,
  serviceName,
  date,
  time,
  address,
  businessUrl,
}: BookingConfirmedEmailProps) {
  return (
    <BaseEmail
      preview={`Réservation confirmée chez ${businessName} le ${date} à ${time}`}
    >
      {/* Icône */}
      <Section style={styles.iconSection}>
        <div style={styles.iconCircle}>📅</div>
      </Section>

      {/* Titre */}
      <Heading style={styles.heading}>Réservation confirmée !</Heading>

      <Text style={styles.intro}>
        Bonjour <strong>{customerName}</strong>, votre réservation chez{" "}
        <strong style={styles.accent}>{businessName}</strong> est bien
        enregistrée.
      </Text>

      {/* Récap réservation */}
      <Section style={styles.recapBox}>
        <Text style={styles.recapTitle}>Récapitulatif</Text>

        <Row>
          <Column style={styles.recapLabel}>Établissement</Column>
          <Column style={styles.recapValue}>{businessName}</Column>
        </Row>

        {serviceName && (
          <Row>
            <Column style={styles.recapLabel}>Prestation</Column>
            <Column style={styles.recapValue}>{serviceName}</Column>
          </Row>
        )}

        <Row>
          <Column colSpan={2}><Hr style={styles.recapHr} /></Column>
        </Row>

        <Row>
          <Column style={styles.recapLabel}>Date</Column>
          <Column style={styles.recapValueBold}>{date}</Column>
        </Row>

        <Row>
          <Column style={styles.recapLabel}>Heure</Column>
          <Column style={styles.recapValueBold}>{time}</Column>
        </Row>

        {address && (
          <Row>
            <Column style={styles.recapLabel}>Adresse</Column>
            <Column style={styles.recapValue}>{address}</Column>
          </Row>
        )}
      </Section>

      {/* Statut */}
      <Section style={styles.statusSection}>
        <div style={styles.statusBadge}>En attente de confirmation</div>
        <Text style={styles.statusNote}>
          Vous recevrez un email dès que l&apos;établissement confirme votre
          réservation.
        </Text>
      </Section>

      {/* CTA */}
      {businessUrl && (
        <Section style={styles.ctaSection}>
          <Button href={businessUrl} style={styles.button}>
            Voir la page de l&apos;établissement →
          </Button>
        </Section>
      )}

      <Text style={styles.footer}>
        Pour annuler ou modifier votre réservation, contactez directement{" "}
        {businessName}.
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
  accent: {
    color: "#4f46e5",
  },
  recapBox: {
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    padding: "20px 24px",
    marginBottom: "24px",
  },
  recapTitle: {
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    margin: "0 0 14px",
    textTransform: "uppercase" as const,
  },
  recapLabel: {
    color: "#94a3b8",
    fontSize: "13px",
    padding: "4px 0",
    width: "50%",
  },
  recapValue: {
    color: "#475569",
    fontSize: "14px",
    fontWeight: "500",
    padding: "4px 0",
    textAlign: "right" as const,
    width: "50%",
  },
  recapValueBold: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "700",
    padding: "4px 0",
    textAlign: "right" as const,
    width: "50%",
  },
  recapHr: {
    borderColor: "#e2e8f0",
    borderTopWidth: "1px",
    margin: "12px 0",
  },
  statusSection: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: "999px",
    color: "#d97706",
    display: "inline-block",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
    padding: "5px 14px",
  },
  statusNote: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0",
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
  footer: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0",
    textAlign: "center" as const,
  },
};
