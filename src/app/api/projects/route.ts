import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runScrapeJob } from "@/lib/scrapeJob";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  websiteUrl: z.string().url(),
  description: z.string().optional(),
  engine: z.enum(["AUTO", "CHEERIO", "FIRECRAWL"]).default("AUTO"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { scrapeJobs: true, generatedApis: true } } },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = createSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name: data.name,
        websiteUrl: data.websiteUrl,
        description: data.description,
        engine: data.engine,
        status: "SCRAPING",
      },
    });

    const job = await prisma.scrapeJob.create({
      data: { projectId: project.id, engine: data.engine, status: "RUNNING", startedAt: new Date() },
    });

    // Run scrape inline — Vercel functions support up to 60s (Pro) / 10s (Hobby may need streaming)
    // We run it synchronously here so the user sees a result fast; for larger sites this
    // can be moved to a queue, but for the free-tier use case this works great.
    runScrapeJob(project.id, job.id, data.websiteUrl, data.engine).catch(console.error);

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
