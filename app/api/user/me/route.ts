import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  return NextResponse.json({
    success: true,
    data: {
      id: session.user.id,
      role: session.user.role ?? "USER",
    },
  });
}
