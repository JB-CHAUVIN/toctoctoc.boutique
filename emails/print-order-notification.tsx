import { Heading, Section, Text, Hr } from "@react-email/components";
import { BaseEmail } from "./_base";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface PrintOrderNotificationEmailProps {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  shipping: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    phone?: string | null;
    email: string;
  };
}

export function PrintOrderNotificationEmail({
  orderId,
  items,
  totalAmount,
  shipping,
}: PrintOrderNotificationEmailProps) {
  return (
    <BaseEmail preview={`Nouvelle commande supports #${orderId.slice(-6)}`}>
      <Section style={styles.badgeSection}>
        <div style={styles.badge}>Nouvelle commande</div>
      </Section>

      <Heading style={styles.heading}>Commande #{orderId.slice(-6)}</Heading>

      <Text style={styles.intro}>
        Une nouvelle commande de supports premium vient d&apos;être passée.
      </Text>

      <Section style={styles.itemsBox}>
        <Text style={styles.itemsTitle}>Articles commandés :</Text>
        {items.map((item) => (
          <Text key={item.productId} style={styles.itemRow}>
            {item.name} × {item.quantity} —{" "}
            <strong>{((item.unitPrice * item.quantity) / 100).toFixed(2)} €</strong>
          </Text>
        ))}
        <Hr style={styles.itemHr} />
        <Text style={styles.totalRow}>
          Total : <strong>{(totalAmount / 100).toFixed(2)} €</strong>
        </Text>
      </Section>

      <Section style={styles.shippingBox}>
        <Text style={styles.itemsTitle}>Livraison :</Text>
        <Text style={styles.shippingText}>
          {shipping.name}
          <br />
          {shipping.address}
          <br />
          {shipping.zipCode} {shipping.city}, {shipping.country}
        </Text>
        <Hr style={styles.itemHr} />
        <Text style={styles.itemsTitle}>Contact client :</Text>
        <Text style={styles.shippingText}>
          Email : {shipping.email}
          {shipping.phone && (
            <>
              <br />
              Tél : {shipping.phone}
            </>
          )}
        </Text>
      </Section>
    </BaseEmail>
  );
}

const styles = {
  badgeSection: {
    textAlign: "center" as const,
    marginBottom: "20px",
  },
  badge: {
    backgroundColor: "#fef3c7",
    borderRadius: "999px",
    color: "#d97706",
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
};
