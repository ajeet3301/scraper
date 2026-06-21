// src/app/dashboard/projects/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Card, Badge } from "@/components/ui/index";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";
import { Globe, Cpu, Code2, FolderOpen, ArrowRight } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  DONE: "bg-green-500/10 text-green-500 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
  SCRAPING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const projects = await prisma.project.findMany({
    where: { userId }, orderBy: { updatedAt: "desc" },
    include: { _count: { select: { scrapeJobs: true, generatedApis: true } } },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">Paste any URL to scrape it and get a live REST API in seconds.</p>
            <NewProjectDialog />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="group">
              <Card className="h-full p-5 hover:border-indigo-500/40 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-indigo-500" />
                  </div>
                  <Badge variant="outline" className={`text-xs ${STATUS_STYLE[p.status] ?? ""}`}>{p.status}</Badge>
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-indigo-400 transition-colors truncate">{p.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 truncate">{p.websiteUrl}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <Cpu className="h-3.5 w-3.5 mx-auto mb-1 text-purple-500" />
                    <p className="text-xs font-medium">{p._count.scrapeJobs}</p>
                    <p className="text-[10px] text-muted-foreground">Jobs</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <Code2 className="h-3.5 w-3.5 mx-auto mb-1 text-green-500" />
                    <p className="text-xs font-medium">{p._count.generatedApis}</p>
                    <p className="text-[10px] text-muted-foreground">APIs</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated {timeAgo(p.updatedAt)}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
