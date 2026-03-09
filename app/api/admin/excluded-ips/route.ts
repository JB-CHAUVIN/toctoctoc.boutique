import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session.user.id : null;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const ips = await prisma.excludedIp.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: ips });
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { ip, label } = await req.json();
  if (!ip || typeof ip !== "string") {
    return NextResponse.json({ error: "IP requise" }, { status: 400 });
  }

  const trimmedIp = ip.trim();

  // Check if already excluded
  const existing = await prisma.excludedIp.findUnique({ where: { ip: trimmedIp } });
  if (existing) {
    return NextResponse.json({ error: "IP déjà exclue" }, { status: 409 });
  }

  const excluded = await prisma.excludedIp.create({
    data: { ip: trimmedIp, label: label?.trim() || null },
  });

  return NextResponse.json({ success: true, data: excluded });
}
