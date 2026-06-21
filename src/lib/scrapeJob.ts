// src/lib/scrapeJob.ts
// Shared scrape execution logic used by both the project-creation route
// and the manual re-scrape route. Kept outside of route.ts files since
// Next.js App Router route files should only export HTTP method handlers.

import { prisma } from "./prisma";
import { scrapeUrl } from "./utils";

export async function runScrapeJob(projectId: string, jobId: string, url: string, engine: string) {
  try {
    let result;

    if (engine === "FIRECRAWL" && process.env.FIRECRAWL_API_KEY) {
      result = await scrapeWithFirecrawl(url);
    } else {
      result = await scrapeUrl(url);
    }

    await prisma.dataset.upsert({
      where: { projectId },
      create: {
        projectId,
        jsonData: result.json as object,
        markdownData: result.markdown,
        schemaData: result.schema as object,
        pageCount: 1,
        sizeBytes: result.sizeBytes,
      },
      update: {
        jsonData: result.json as object,
        markdownData: result.markdown,
        schemaData: result.schema as object,
        sizeBytes: result.sizeBytes,
        updatedAt: new Date(),
      },
    });

    const endpoints = ["data", "search", "schema", "docs"];
    for (const ep of endpoints) {
      await prisma.generatedAPI.upsert({
        where: { id: `${projectId}_${ep}` },
        create: {
          id: `${projectId}_${ep}`,
          projectId,
          endpoint: `/api/projects/${projectId}/${ep}`,
          method: "GET",
          description:
            ep === "data" ? "Get all scraped data with pagination" :
            ep === "search" ? "Full-text search" :
            ep === "schema" ? "Get detected schema" : "OpenAPI specification",
        },
        update: {},
      });
    }

    await prisma.scrapeJob.update({
      where: { id: jobId },
      data: { status: "DONE", finishedAt: new Date(), pagesScraped: 1, engine: result.engine.toUpperCase() },
    });

    await prisma.project.update({ where: { id: projectId }, data: { status: "DONE" } });
  } catch (err) {
    console.error("Scrape failed:", err);
    await prisma.scrapeJob.update({
      where: { id: jobId },
      data: { status: "FAILED", finishedAt: new Date(), errorMessage: String(err) },
    });
    await prisma.project.update({ where: { id: projectId }, data: { status: "FAILED" } });
  }
}

async function scrapeWithFirecrawl(url: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown"] }),
  });

  if (!res.ok) throw new Error(`Firecrawl error: ${res.status}`);
  const data = await res.json();
  const result = data.data ?? {};
  const metadata = result.metadata ?? {};

  const json = {
    url,
    title: metadata.title ?? "Untitled",
    description: metadata.description ?? null,
    content: (result.markdown ?? "").slice(0, 3000),
    scrapedAt: new Date().toISOString(),
    sourceUrl: url,
  };

  const schema = [
    { name: "url", type: "url", description: "Source URL", required: true },
    { name: "title", type: "string", description: "Page title", required: true },
    { name: "description", type: "string", description: "Meta description", required: false },
    { name: "content", type: "string", description: "Markdown content", required: false },
    { name: "scrapedAt", type: "date", description: "Scrape timestamp", required: true },
  ];

  return { json, markdown: result.markdown ?? "", schema, engine: "firecrawl", sizeBytes: JSON.stringify(result).length };
}
