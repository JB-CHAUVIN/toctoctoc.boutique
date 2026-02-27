import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkOwnership(blockId: string, userId: string) {
  const block = await prisma.showcaseBlock.findUnique({
    where: { id: blockId },
    include: { business: { select: { userId: true } } },
  });
  return block?.business.userId === userId ? block : null;
}

/** PATCH → update isActive, order, or content */
export async function PATCH(req: Request, { params }: { params: { blockId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const block = await checkOwnership(params.blockId, session.user.id);
  if (!block) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { isActive, order, content } = body as {
    isActive?: boolean;
    order?: number;
    content?: object;
  };

  const updated = await prisma.showcaseBlock.update({
    where: { id: params.blockId },
    data: {
      ...(isActive !== undefined && { isActive }),
      ...(order !== undefined && { order }),
      ...(content !== undefined && { content }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

/** DELETE → remove a block */
export async function DELETE(req: Request, { params }: { params: { blockId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const block = await checkOwnership(params.blockId, session.user.id);
  if (!block) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.showcaseBlock.delete({ where: { id: params.blockId } });
  return NextResponse.json({ success: true });
}
