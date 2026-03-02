import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { ContactNotificationEmail } from "@/emails/contact-notification";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, subject, message } = parsed.data;

    await prisma.contactRequest.create({ data: parsed.data });

    const receivedAt = format(new Date(), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });

    sendEmail({
      to: "contact@toctoctoc.boutique",
      subject: `[Contact] ${subject ?? "Nouveau message"} — ${name}`,
      template: ContactNotificationEmail({ senderName: name, senderEmail: email, subject, message, receivedAt }),
    }).catch((err) => console.error("[EMAIL_CONTACT]", err));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
