import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runScrapeJob } from "@/lib/scrapeJob";
import { z } from "zod";

// Allow this function (and the waitUntil-tracked background scrape) up to 60s.
// Hobby plan caps at 60s; Pro/Enterprise can go higher if you raise this.
export const maxDuration = 60;

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

    // IMPORTANT: On Vercel, once this function returns its response, the serverless
    // instance is frozen/killed — any un-awaited background promise gets cut off
    // mid-flight. waitUntil() tells Vercel to keep the function alive until this
    // promise settles, even though we've already sent the response to the client.
    waitUntil(
      runScrapeJob(project.id, job.id, data.websiteUrl, data.engine).catch(async (err) => {
        console.error("Scrape job failed:", err);
        // Make sure a crashed job doesn't stay stuck in RUNNING forever
        await prisma.scrapeJob.update({
          where: { id: job.id },
          data: { status: "FAILED", errorMessage: String(err?.message ?? err), finishedAt: new Date() },
        }).catch(() => {});
        await prisma.project.update({
          where: { id: project.id },
          data: { status: "FAILED" },
        }).catch(() => {});
      })
    );

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}