// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/index";
import { FolderOpen, Cpu, BarChart3, Key, Plus, ArrowRight, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";
import { DashboardChart } from "@/components/dashboard/DashboardChart";

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    DONE: "bg-green-500/10 text-green-500 border-green-500/20",
    FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
    SCRAPING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    QUEUED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [totalProjects, totalJobs, doneJobs, apiKeys, recentJobs, recentProjects] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.scrapeJob.count({ where: { project: { userId } } }),
    prisma.scrapeJob.count({ where: { project: { userId }, status: "DONE" } }),
    prisma.aPIKey.findMany({ where: { userId } }),
    prisma.scrapeJob.findMany({
      where: { project: { userId } },
      orderBy: { createdAt: "desc" }, take: 5,
      include: { project: { select: { name: true, id: true } } },
    }),
    prisma.project.findMany({
      where: { userId }, orderBy: { updatedAt: "desc" }, take: 5,
      include: { _count: { select: { scrapeJobs: true, generatedApis: true } } },
    }),
  ]);

  const totalApiCalls = apiKeys.reduce((s, k) => s + k.usageCount, 0);
  const successRate = totalJobs > 0 ? Math.round((doneJobs / totalJobs) * 100) : 0;

  const stats = [
    { label: "Projects", value: totalProjects, icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Scrape Jobs", value: totalJobs, icon: Cpu, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "API Calls", value: totalApiCalls.toLocaleString(), icon: BarChart3, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "API Keys", value: apiKeys.length, icon: Key, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Hello, {session?.user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {totalProjects === 0 ? "Create your first project to get started" : `${totalProjects} project${totalProjects !== 1 ? "s" : ""} · ${successRate}% success rate`}
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <DashboardChart userId={userId} />

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent jobs */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Jobs</CardTitle>
            <Link href="/dashboard/projects" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No jobs yet</p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <Link href={`/dashboard/projects/${job.project.id}`} className="text-sm font-medium hover:underline truncate block">
                        {job.project.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{job.engine} · {timeAgo(job.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ml-2 ${statusBadge(job.status)}`}>{job.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent projects */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Your Projects</CardTitle>
            <Link href="/dashboard/projects" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No projects yet</p>
                <NewProjectDialog size="sm" />
              </div>
            ) : (
              <div className="space-y-2">
                {recentProjects.map((p) => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.websiteUrl}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ml-2 ${statusBadge(p.status)}`}>{p.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
