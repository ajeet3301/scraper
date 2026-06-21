import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey, checkRateLimit } from "@/lib/apiAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const auth = await verifyApiKey(req, projectId);
    if (!auth) return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

    const rl = checkRateLimit(`data:${auth.key.id}`, 100, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "X-RateLimit-Remaining": "0" } });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const sort = searchParams.get("sort");
    const order = (searchParams.get("order") ?? "asc") as "asc" | "desc";

    const dataset = await prisma.dataset.findUnique({ where: { projectId } });

    if (!dataset?.jsonData) {
      return NextResponse.json({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    let items = Array.isArray(dataset.jsonData)
      ? (dataset.jsonData as Record<string, unknown>[])
      : [dataset.jsonData as Record<string, unknown>];

    if (sort) {
      items = [...items].sort((a, b) => {
        const cmp = String(a[sort]).localeCompare(String(b[sort]), undefined, { numeric: true });
        return order === "desc" ? -cmp : cmp;
      });
    }

    const total = items.length;
    const paginated = items.slice((page - 1) * limit, page * limit);

    await prisma.generatedAPI.updateMany({
      where: { projectId, endpoint: { contains: "/data" } },
      data: { hitCount: { increment: 1 } },
    });

    return NextResponse.json(
      { data: paginated, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
      { headers: { "Access-Control-Allow-Origin": "*", "X-RateLimit-Remaining": String(rl.remaining) } }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "X-API-Key, Content-Type",
    },
  });
}
