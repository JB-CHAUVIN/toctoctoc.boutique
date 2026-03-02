import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Font,
} from "@react-email/components";
import type { ReactNode } from "react";

const APP_NAME = "TocTocToc.boutique";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://toctoctoc.boutique";

interface BaseEmailProps {
  preview: string;
  children: ReactNode;
}

export function BaseEmail({ preview, children }: BaseEmailProps) {
  return (
    <Html lang="fr">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        {/* Header */}
        <Section style={styles.header}>
          <Row>
            <Column style={styles.logoCol}>
              <Img
                src={`${APP_URL}/logo.png`}
                width={32}
                height={32}
                alt={APP_NAME}
                style={styles.logoImg}
              />
            </Column>
            <Column style={styles.logoTextCol}>
              <Text style={styles.logoText}>{APP_NAME}</Text>
            </Column>
          </Row>
        </Section>

        {/* Card */}
        <Container style={styles.card}>{children}</Container>

        {/* Footer */}
        <Container style={styles.footer}>
          <Hr style={styles.hr} />
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {APP_NAME} · Tous droits réservés
          </Text>
          <Text style={styles.footerLinks}>
            <Link href={`${APP_URL}/dashboard`} style={styles.footerLink}>
              Dashboard
            </Link>
            {"  ·  "}
            <Link href={`${APP_URL}`} style={styles.footerLink}>
              Site web
            </Link>
          </Text>
          <Text style={styles.footerNote}>
            Vous recevez cet email car vous avez un compte sur {APP_NAME}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f8fafc",
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    margin: "0",
    padding: "0",
  },
  header: {
    backgroundColor: "#4f46e5",
    padding: "16px 24px",
  },
  logoCol: {
    width: "40px",
    verticalAlign: "middle" as const,
  },
  logoImg: {
    borderRadius: "6px",
    display: "block",
  },
  logoTextCol: {
    verticalAlign: "middle" as const,
    paddingLeft: "10px",
  },
  logoText: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "-0.3px",
    margin: "0",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    margin: "24px auto",
    maxWidth: "560px",
    padding: "40px 48px",
  },
  footer: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "0 48px 40px",
  },
  hr: {
    borderColor: "#e2e8f0",
    borderTopWidth: "1px",
    margin: "0 0 24px",
  },
  footerText: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: "0 0 4px",
    textAlign: "center" as const,
  },
  footerLinks: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: "0 0 8px",
    textAlign: "center" as const,
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "underline",
  },
  footerNote: {
    color: "#cbd5e1",
    fontSize: "11px",
    margin: "0",
    textAlign: "center" as const,
  },
};
