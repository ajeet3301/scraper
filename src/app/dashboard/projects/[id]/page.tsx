// src/app/dashboard/projects/[id]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/dashboard/ProjectDetail";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      scrapeJobs: { orderBy: { createdAt: "desc" }, take: 10 },
      datasets: { orderBy: { createdAt: "desc" }, take: 1 },
      generatedApis: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!project) notFound();

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return <ProjectDetail project={project as Parameters<typeof ProjectDetail>[0]["project"]} baseUrl={baseUrl} />;
}
