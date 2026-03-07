import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyVisitor } from "@/lib/visitor-type";

export async function POST(req: Request) {
  try {
    const { pathname, ip, userAgent, referer } = await req.json();
    if (!pathname || typeof pathname !== "string") {
      return NextResponse.json({ error: "pathname required" }, { status: 400 });
    }

    const visitorType = classifyVisitor(userAgent);

    prisma.log.create({
      data: {
        action: "pageview",
        level: "INFO",
        meta: {
          pathname,
          visitorType,
          ...(ip && { ip }),
          ...(userAgent && { ua: userAgent }),
          ...(referer && { referer }),
        },
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}
