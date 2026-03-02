import { Column, Heading, Row, Section, Text } from "@react-email/components";
import { BaseEmail } from "./_base";

interface BookingStatusEmailProps {
  customerName: string;
  businessName: string;
  serviceName?: string | null;
  date: string;
  time: string;
  status: "CONFIRMED" | "CANCELLED";
  cancellationReason?: string;
}

export function BookingStatusEmail({
  customerName,
  businessName,
  serviceName,
  date,
  time,
  status,
  cancellationReason,
}: BookingStatusEmailProps) {
  const isConfirmed = status === "CONFIRMED";

  return (
    <BaseEmail
      preview={
        isConfirmed
          ? `Votre réservation chez ${businessName} est confirmée !`
          : `Votre réservation chez ${businessName} a été annulée`
      }
    >
      {/* Icône */}
      <Section style={styles.iconSection}>
        <div
          style={{
            ...styles.iconCircle,
            backgroundColor: isConfirmed ? "#d1fae5" : "#fee2e2",
          }}
        >
          {isConfirmed ? "✓" : "✕"}
        </div>
      </Section>

      {/* Titre */}
      <Heading style={styles.heading}>
        {isConfirmed ? "Réservation confirmée !" : "Réservation annulée"}
      </Heading>

      <Text style={styles.intro}>
        Bonjour <strong>{customerName}</strong>,
        {isConfirmed ? (
          <>
            {" "}
            votre réservation chez{" "}
            <strong style={styles.accent}>{businessName}</strong> est
            officiellement confirmée.
          </>
        ) : (
          <>
            {" "}
            votre réservation chez{" "}
            <strong style={{ color: "#ef4444" }}>{businessName}</strong> a
            malheureusement été annulée.
          </>
        )}
      </Text>

      {/* Récap */}
      <Section style={styles.recapBox}>
        {serviceName && (
          <Row>
            <Column style={styles.label}>Prestation</Column>
            <Column style={styles.value}>{serviceName}</Column>
          </Row>
        )}
        <Row>
          <Column style={styles.label}>Date</Column>
          <Column style={styles.valueBold}>{date}</Column>
        </Row>
        <Row>
          <Column style={styles.label}>Heure</Column>
          <Column style={styles.valueBold}>{time}</Column>
        </Row>
      </Section>

      {!isConfirmed && cancellationReason && (
        <Section style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Motif d&apos;annulation</Text>
          <Text style={styles.reasonText}>{cancellationReason}</Text>
        </Section>
      )}

      <Text style={styles.footer}>
        {isConfirmed
          ? `À bientôt chez ${businessName} !`
          : `Pour reprendre rendez-vous, rendez-vous directement sur le site de ${businessName}.`}
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
    borderRadius: "50%",
    color: "#0f172a",
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
  label: {
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "500",
    padding: "4px 0",
    width: "50%",
  },
  value: {
    color: "#475569",
    fontSize: "14px",
    fontWeight: "500",
    padding: "4px 0",
    textAlign: "right" as const,
    width: "50%",
  },
  valueBold: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "700",
    padding: "4px 0",
    textAlign: "right" as const,
    width: "50%",
  },
  reasonBox: {
    backgroundColor: "#fff1f2",
    borderRadius: "8px",
    border: "1px solid #fecdd3",
    padding: "16px 20px",
    marginBottom: "24px",
  },
  reasonLabel: {
    color: "#be123c",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    margin: "0 0 6px",
    textTransform: "uppercase" as const,
  },
  reasonText: {
    color: "#be123c",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0",
  },
  footer: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0",
    textAlign: "center" as const,
  },
};
