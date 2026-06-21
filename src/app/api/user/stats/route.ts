import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  // Last 7 days of job counts
  const jobs = await prisma.scrapeJob.findMany({
    where: { project: { userId }, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    select: { createdAt: true },
  });

  const days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days[d.toLocaleDateString("en", { weekday: "short" })] = 0;
  }
  for (const job of jobs) {
    const label = new Date(job.createdAt).toLocaleDateString("en", { weekday: "short" });
    if (label in days) days[label]++;
  }

  const dailyJobs = Object.entries(days).map(([date, jobs]) => ({ date, jobs }));

  // Status breakdown
  const statusGroups = await prisma.project.groupBy({
    by: ["status"],
    where: { userId },
    _count: true,
  });
  const statusCounts = statusGroups.map((g) => ({ name: g.status, value: g._count }));

  return NextResponse.json({ dailyJobs, statusCounts });
}
