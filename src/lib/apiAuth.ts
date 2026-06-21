// src/lib/apiAuth.ts
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export async function verifyApiKey(req: NextRequest, projectId: string) {
  const apiKey = req.headers.get("X-API-Key") ?? req.headers.get("x-api-key");
  if (!apiKey) return null;

  const key = await prisma.aPIKey.findFirst({
    where: { key: apiKey, isActive: true },
    include: { user: { select: { id: true } } },
  });
  if (!key) return null;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: key.user.id },
  });
  if (!project) return null;

  await prisma.aPIKey.update({
    where: { id: key.id },
    data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
  });

  return { key, project };
}

// Simple in-memory rate limiter (per Vercel function instance — good enough for free tier)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string, limit = 100, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count += 1;
  const allowed = entry.count <= limit;
  return { allowed, remaining: Math.max(0, limit - entry.count) };
}
