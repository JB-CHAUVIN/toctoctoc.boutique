import { Heading, Hr, Section, Text } from "@react-email/components";
import { BaseEmail } from "./_base";

interface ContactNotificationEmailProps {
  senderName: string;
  senderEmail: string;
  subject?: string | null;
  message: string;
  receivedAt: string;
}

export function ContactNotificationEmail({
  senderName,
  senderEmail,
  subject,
  message,
  receivedAt,
}: ContactNotificationEmailProps) {
  return (
    <BaseEmail preview={`Nouveau message de ${senderName} — ${subject ?? "Sans objet"}`}>
      <Section style={styles.badgeSection}>
        <div style={styles.badge}>Nouveau message</div>
      </Section>

      <Heading style={styles.heading}>Message reçu</Heading>

      {/* Expéditeur */}
      <Section style={styles.senderBox}>
        <Text style={styles.row}>
          <span style={styles.label}>De</span>
          <span style={styles.value}>{senderName}</span>
        </Text>
        <Text style={styles.row}>
          <span style={styles.label}>Email</span>
          <span style={styles.value}>{senderEmail}</span>
        </Text>
        {subject && (
          <Text style={styles.row}>
            <span style={styles.label}>Objet</span>
            <span style={styles.value}>{subject}</span>
          </Text>
        )}
        <Text style={styles.row}>
          <span style={styles.label}>Reçu le</span>
          <span style={styles.value}>{receivedAt}</span>
        </Text>
      </Section>

      <Hr style={styles.hr} />

      {/* Message */}
      <Text style={styles.messageLabel}>Message</Text>
      <Section style={styles.messageBox}>
        <Text style={styles.messageText}>{message}</Text>
      </Section>

      <Text style={styles.reply}>
        Pour répondre, envoyez un email directement à{" "}
        <span style={styles.replyEmail}>{senderEmail}</span>
      </Text>
    </BaseEmail>
  );
}

const styles = {
  badgeSection: {
    textAlign: "center" as const,
    marginBottom: "20px",
  },
  badge: {
    backgroundColor: "#ede9fe",
    borderRadius: "999px",
    color: "#4f46e5",
    display: "inline-block",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    padding: "5px 14px",
    textTransform: "uppercase" as const,
  },
  heading: {
    color: "#0f172a",
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    margin: "0 0 20px",
    textAlign: "center" as const,
  },
  senderBox: {
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    padding: "16px 20px",
    marginBottom: "20px",
  },
  row: {
    color: "#475569",
    display: "flex" as const,
    fontSize: "14px",
    justifyContent: "space-between" as const,
    lineHeight: "1.5",
    margin: "0 0 6px",
  },
  label: {
    color: "#94a3b8",
    fontWeight: "500",
  },
  value: {
    color: "#0f172a",
    fontWeight: "600",
  },
  hr: {
    borderColor: "#f1f5f9",
    borderTopWidth: "1px",
    margin: "0 0 20px",
  },
  messageLabel: {
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    margin: "0 0 10px",
    textTransform: "uppercase" as const,
  },
  messageBox: {
    backgroundColor: "#f8fafc",
    borderLeft: "3px solid #6366f1",
    borderRadius: "4px",
    padding: "16px 20px",
    marginBottom: "24px",
  },
  messageText: {
    color: "#334155",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: "0",
    whiteSpace: "pre-wrap" as const,
  },
  reply: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0",
    textAlign: "center" as const,
  },
  replyEmail: {
    color: "#6366f1",
    fontWeight: "600",
  },
};
