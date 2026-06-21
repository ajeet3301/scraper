// src/app/dashboard/playground/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlaygroundClient } from "@/components/dashboard/PlaygroundClient";

export default async function PlaygroundPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const [projects, apiKeys] = await Promise.all([
    prisma.project.findMany({ where: { userId, status: "DONE" }, select: { id: true, name: true }, orderBy: { updatedAt: "desc" } }),
    prisma.aPIKey.findMany({ where: { userId, isActive: true }, select: { key: true, name: true } }),
  ]);
  return <PlaygroundClient projects={projects} apiKeys={apiKeys} />;
}
