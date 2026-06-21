import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey, checkRateLimit } from "@/lib/apiAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const auth = await verifyApiKey(req, projectId);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(`search:${auth.key.id}`, 100, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const field = searchParams.get("field");

  if (!q) return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });

  const dataset = await prisma.dataset.findUnique({ where: { projectId } });
  if (!dataset?.jsonData) return NextResponse.json({ results: [], total: 0, query: q });

  const items = Array.isArray(dataset.jsonData)
    ? (dataset.jsonData as Record<string, unknown>[])
    : [dataset.jsonData as Record<string, unknown>];

  const qLower = q.toLowerCase();

  const results = items
    .map((item) => {
      let score = 0;
      const fields = field ? [field] : Object.keys(item);
      for (const f of fields) {
        const val = String(item[f] ?? "").toLowerCase();
        if (val === qLower) score += 10;
        else if (val.startsWith(qLower)) score += 5;
        else if (val.includes(qLower)) score += 2;
      }
      return { ...item, _score: score };
    })
    .filter((i) => i._score > 0)
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...item }) => ({ ...item, score: _score }));

  await prisma.generatedAPI.updateMany({
    where: { projectId, endpoint: { contains: "/search" } },
    data: { hitCount: { increment: 1 } },
  });

  return NextResponse.json(
    { results, total: results.length, query: q },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "X-API-Key" },
  });
}
