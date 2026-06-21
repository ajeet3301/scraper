// src/app/dashboard/settings/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/dashboard/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const [user, apiKeys] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, image: true, role: true, createdAt: true } }),
    prisma.aPIKey.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);
  return <SettingsClient user={user!} apiKeys={apiKeys} />;
}
