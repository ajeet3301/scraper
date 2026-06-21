import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runScrapeJob } from "@/lib/scrapeJob";
import { z } from "zod";

const schema = z.object({
  projectId: z.string(),
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = schema.parse(body);

    const project = await prisma.project.findFirst({ where: { id: data.projectId, userId: session.user.id } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const job = await prisma.scrapeJob.create({
      data: { projectId: data.projectId, engine: project.engine, status: "RUNNING", startedAt: new Date() },
    });

    await prisma.project.update({ where: { id: data.projectId }, data: { status: "SCRAPING" } });

    runScrapeJob(data.projectId, job.id, data.url, project.engine).catch(console.error);

    return NextResponse.json({ jobId: job.id, status: "RUNNING" });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation error" }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
