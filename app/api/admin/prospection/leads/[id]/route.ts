import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["DISCOVERED", "CONTACTED", "CONVERTED", "DECLINED"]).optional(),
  businessId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { status, businessId, notes } = parsed.data;

  const updateData: Record<string, unknown> = {};
  if (status !== undefined) {
    updateData.status = status;
    if (status === "CONTACTED") updateData.contactedAt = new Date();
    if (status === "DISCOVERED") updateData.contactedAt = null;
  }
  if (businessId !== undefined) updateData.businessId = businessId;
  if (notes !== undefined) updateData.notes = notes;

  const lead = await prisma.prospectLead.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, data: lead });
}
