import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/apiAuth";
import { buildOpenApiSpec } from "@/lib/utils";

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

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const spec = buildOpenApiSpec(
    projectId,
    auth.project.name,
    baseUrl,
    (dataset?.schemaData as Record<string, unknown>[] | null) ?? []
  );

  await prisma.generatedAPI.updateMany({
    where: { projectId, endpoint: { contains: "/docs" } },
    data: { hitCount: { increment: 1 } },
  });

  return NextResponse.json(spec, { headers: { "Access-Control-Allow-Origin": "*" } });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "X-API-Key" },
  });
}
