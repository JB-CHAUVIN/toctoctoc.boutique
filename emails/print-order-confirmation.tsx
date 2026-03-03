import { Heading, Section, Text, Hr } from "@react-email/components";
import { BaseEmail } from "./_base";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface PrintOrderConfirmationEmailProps {
  name: string;
  items: OrderItem[];
  totalAmount: number;
  shipping: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export function PrintOrderConfirmationEmail({
  name,
  items,
  totalAmount,
  shipping,
}: PrintOrderConfirmationEmailProps) {
  return (
    <BaseEmail preview="Votre commande de supports premium est confirmée !">
      <Section style={styles.badgeSection}>
        <div style={styles.badge}>Commande confirmée</div>
      </Section>

      <Heading style={styles.heading}>Merci pour votre commande !</Heading>

      <Text style={styles.intro}>
        Bonjour {name}, votre commande de supports premium a bien été reçue et
        confirmée. Nous préparons vos supports avec soin.
      </Text>

      <Section style={styles.itemsBox}>
        <Text style={styles.itemsTitle}>Récapitulatif :</Text>
        {items.map((item) => (
          <Text key={item.productId} style={styles.itemRow}>
            {item.name} × {item.quantity} —{" "}
            <strong>{((item.unitPrice * item.quantity) / 100).toFixed(2)} €</strong>
          </Text>
        ))}
        <Hr style={styles.itemHr} />
        <Text style={styles.totalRow}>
          Total : <strong style={styles.accent}>{(totalAmount / 100).toFixed(2)} €</strong>
        </Text>
      </Section>

      <Section style={styles.shippingBox}>
        <Text style={styles.itemsTitle}>Adresse de livraison :</Text>
        <Text style={styles.shippingText}>
          {shipping.name}
          <br />
          {shipping.address}
          <br />
          {shipping.zipCode} {shipping.city}
          <br />
          {shipping.country}
        </Text>
      </Section>

      <Hr style={styles.hr} />

      <Text style={styles.note}>
        Vous recevrez un email dès que votre commande sera expédiée. Pour toute
        question, contactez-nous à contact@toctoctoc.boutique.
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
    backgroundColor: "#dcfce7",
    borderRadius: "999px",
    color: "#16a34a",
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
  itemsBox: {
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    padding: "20px 24px",
    marginBottom: "16px",
  },
  itemsTitle: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 12px",
  },
  itemRow: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 6px",
  },
  itemHr: {
    borderColor: "#e2e8f0",
    borderTopWidth: "1px",
    margin: "12px 0",
  },
  totalRow: {
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: "700",
    margin: "0",
  },
  shippingBox: {
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    padding: "20px 24px",
    marginBottom: "24px",
  },
  shippingText: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0",
  },
  hr: {
    borderColor: "#f1f5f9",
    borderTopWidth: "1px",
    margin: "0 0 24px",
  },
  note: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0",
    textAlign: "center" as const,
  },
};
