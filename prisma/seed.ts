import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  const pw = await bcrypt.hash("demo123456", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: { name: "Demo User", email: "demo@example.com", password: pw, role: "USER" },
  });

  const adminPw = await bcrypt.hash("admin123456", 12);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "Admin", email: "admin@example.com", password: adminPw, role: "ADMIN" },
  });

  await prisma.aPIKey.upsert({
    where: { key: "usc_live_demo00000000000000000000000000" },
    update: {},
    create: {
      userId: user.id,
      name: "Demo Key",
      key: "usc_live_demo00000000000000000000000000",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "demo_proj_001" },
    update: {},
    create: {
      id: "demo_proj_001",
      userId: user.id,
      name: "Hacker News",
      websiteUrl: "https://news.ycombinator.com",
      status: "DONE",
      engine: "BEAUTIFULSOUP",
    },
  });

  const items = [
    { rank: 1, title: "Show HN: I built a web scraper that generates APIs", points: 421, author: "thrower123", comments: 89 },
    { rank: 2, title: "The state of AI in 2026", points: 312, author: "airesearcher", comments: 143 },
    { rank: 3, title: "Ask HN: Best free hosting in 2026?", points: 287, author: "devguy99", comments: 201 },
    { rank: 4, title: "Postgres is the answer", points: 198, author: "dbperson", comments: 67 },
    { rank: 5, title: "Why I switched from React to plain HTML", points: 176, author: "minimalist_dev", comments: 99 },
  ];

  await prisma.dataset.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      jsonData: items,
      markdownData: "# Hacker News\n\n" + items.map(i => `- **${i.title}** (${i.points} pts)`).join("\n"),
      schemaData: [
        { name: "rank", type: "number", description: "Story rank", required: true },
        { name: "title", type: "string", description: "Story title", required: true },
        { name: "points", type: "number", description: "Upvotes", required: false },
        { name: "author", type: "string", description: "Username", required: false },
        { name: "comments", type: "number", description: "Comment count", required: false },
      ],
      pageCount: 1,
      sizeBytes: JSON.stringify(items).length,
    },
  });

  const endpoints = ["data", "search", "schema", "docs"];
  for (const ep of endpoints) {
    await prisma.generatedAPI.upsert({
      where: { id: `demo_${ep}` },
      update: {},
      create: {
        id: `demo_${ep}`,
        projectId: project.id,
        endpoint: `/api/projects/${project.id}/${ep}`,
        method: "GET",
        description: ep === "data" ? "Get all items" : ep === "search" ? "Search items" : ep === "schema" ? "Get schema" : "OpenAPI docs",
      },
    });
  }

  await prisma.scrapeJob.upsert({
    where: { id: "demo_job_001" },
    update: {},
    create: {
      id: "demo_job_001",
      projectId: project.id,
      engine: "BEAUTIFULSOUP",
      status: "DONE",
      pagesScraped: 1,
      startedAt: new Date(Date.now() - 4000),
      finishedAt: new Date(),
    },
  });

  console.log("✅ Seed done!");
  console.log("  demo@example.com / demo123456");
  console.log("  admin@example.com / admin123456");
}

main().catch(console.error).finally(() => prisma.$disconnect());
