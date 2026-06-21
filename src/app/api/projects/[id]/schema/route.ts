import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/apiAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const auth = await verifyApiKey(req, projectId);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dataset = await prisma.dataset.findUnique({
    where: { projectId },
    select: { schemaData: true },
  });

  await prisma.generatedAPI.updateMany({
    where: { projectId, endpoint: { contains: "/schema" } },
    data: { hitCount: { increment: 1 } },
  });

  return NextResponse.json(
    { fields: dataset?.schemaData ?? [], projectId },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "X-API-Key" },
  });
}
