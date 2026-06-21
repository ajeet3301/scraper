import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(50),
  usageLimit: z.number().min(100).max(1_000_000).default(10000),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const keys = await prisma.aPIKey.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = createSchema.parse(body);

    const count = await prisma.aPIKey.count({ where: { userId: session.user.id } });
    if (count >= 10) return NextResponse.json({ error: "Maximum 10 API keys allowed" }, { status: 400 });

    const key = await prisma.aPIKey.create({
      data: { userId: session.user.id, name: data.name, key: generateApiKey(), usageLimit: data.usageLimit },
    });

    return NextResponse.json(key, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
