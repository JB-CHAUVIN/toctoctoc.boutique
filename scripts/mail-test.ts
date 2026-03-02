import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import React from "react";

import { WelcomeEmail } from "../emails/welcome";
import { ClaimSuccessEmail } from "../emails/claim-success";
import { SubscriptionConfirmedEmail } from "../emails/subscription-confirmed";
import { BookingConfirmedEmail } from "../emails/booking-confirmed";
import { BookingStatusEmail } from "../emails/booking-status";
import { PasswordResetEmail } from "../emails/password-reset";

const TO = process.argv[2] ?? "test@example.com";
const APP_URL = "https://toctoctoc.boutique";

const EMAILS: Array<{ subject: string; element: React.ReactElement }> = [
  {
    subject: "Bienvenue sur TocTocToc.boutique",
    element: React.createElement(WelcomeEmail, {
      name: "Marie Dupont",
      dashboardUrl: `${APP_URL}/dashboard`,
    }),
  },
  {
    subject: 'Votre espace "Café de la Paix" est activé !',
    element: React.createElement(ClaimSuccessEmail, {
      businessName: "Café de la Paix",
      email: "marie@example.com",
      dashboardUrl: `${APP_URL}/dashboard`,
      upgradePlanUrl: `${APP_URL}/dashboard/billing`,
    }),
  },
  {
    subject: "Abonnement Starter activé !",
    element: React.createElement(SubscriptionConfirmedEmail, {
      name: "Marie Dupont",
      plan: "STARTER",
      periodEnd: "2 avril 2026",
      dashboardUrl: `${APP_URL}/dashboard`,
      isTrialing: false,
    }),
  },
  {
    subject: "Essai gratuit Pro démarré !",
    element: React.createElement(SubscriptionConfirmedEmail, {
      name: "Marie Dupont",
      plan: "PRO",
      periodEnd: "16 mars 2026",
      dashboardUrl: `${APP_URL}/dashboard`,
      isTrialing: true,
    }),
  },
  {
    subject: "Réservation reçue — Café de la Paix",
    element: React.createElement(BookingConfirmedEmail, {
      customerName: "Jean Martin",
      businessName: "Café de la Paix",
      serviceName: "Coupe + Barbe",
      date: "Vendredi 6 mars 2026",
      time: "14h30",
      address: "12 rue de la Paix, 75001 Paris",
      businessUrl: `${APP_URL}/cafe-de-la-paix`,
    }),
  },
  {
    subject: "Votre réservation est confirmée — Café de la Paix",
    element: React.createElement(BookingStatusEmail, {
      customerName: "Jean Martin",
      businessName: "Café de la Paix",
      serviceName: "Coupe + Barbe",
      date: "Vendredi 6 mars 2026",
      time: "14h30",
      status: "CONFIRMED",
    }),
  },
  {
    subject: "Votre réservation a été annulée — Café de la Paix",
    element: React.createElement(BookingStatusEmail, {
      customerName: "Jean Martin",
      businessName: "Café de la Paix",
      serviceName: "Coupe + Barbe",
      date: "Vendredi 6 mars 2026",
      time: "14h30",
      status: "CANCELLED",
      cancellationReason: "Fermeture exceptionnelle ce jour-là, veuillez nous excuser.",
    }),
  },
  {
    subject: "Réinitialisation de votre mot de passe",
    element: React.createElement(PasswordResetEmail, {
      resetUrl: `${APP_URL}/reset-password?token=abc123def456`,
      expiresInMinutes: 60,
    }),
  },
];

async function main() {
  console.log(`📧 Mail test — TocTocToc.boutique → ${TO}\n`);

  const transporter = nodemailer.createTransport({
    host: "mail.toctoctoc.boutique",
    port: 587,
    secure: false,
    auth: { user: "smtpuser", pass: "RbzSWkJ7zFMZieFLExw26JiU" },
    tls: { rejectUnauthorized: false },
  });

  process.stdout.write("Vérification connexion SMTP... ");
  await transporter.verify();
  console.log("✅ OK\n");

  for (let i = 0; i < EMAILS.length; i++) {
    const { subject, element } = EMAILS[i];
    process.stdout.write(`[${i + 1}/${EMAILS.length}] ${subject}... `);
    const html = await render(element);
    await transporter.sendMail({
      from: '"TocTocToc.boutique" <noreply@toctoctoc.boutique>',
      to: TO,
      subject,
      html,
    });
    console.log("✅");
  }

  console.log(`\n🎉 ${EMAILS.length} emails envoyés à ${TO}`);
}

main().catch((err) => {
  console.error("\n❌ Erreur :", err.message);
  process.exit(1);
});
