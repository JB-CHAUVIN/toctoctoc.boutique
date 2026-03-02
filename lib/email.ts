import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false, // STARTTLS sur 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false }, // cert self-signed pour l'instant
});

export async function sendEmail({
  to,
  subject,
  template,
}: {
  to: string;
  subject: string;
  template: ReactElement;
}) {
  const html = await render(template);

  await transporter.sendMail({
    from: `"${process.env.NEXT_PUBLIC_APP_NAME ?? "TocTocToc.boutique"}" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html,
  });
}
