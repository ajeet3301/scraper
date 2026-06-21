"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from "@/components/ui/index";
import { Globe, RefreshCw, Download, Code2, Database, Cpu, FileText, Copy, ExternalLink, CheckCircle2, XCircle, Loader2, Clock, Play } from "lucide-react";
import { toast } from "sonner";
import { timeAgo, formatBytes, jsonToCsv, buildOpenApiSpec } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Project = {
  id: string; name: string; websiteUrl: string; description: string | null;
  status: string; engine: string; schedule: string | null;
  createdAt: Date; updatedAt: Date;
  scrapeJobs: { id: string; engine: string; status: string; pagesScraped: number; errorMessage: string | null; startedAt: Date | null; finishedAt: Date | null; createdAt: Date }[];
  datasets: { id: string; jsonData: unknown; markdownData: string | null; schemaData: unknown; sizeBytes: number; pageCount: number; updatedAt: Date }[];
  generatedApis: { id: string; endpoint: string; method: string; description: string | null; hitCount: number }[];
};

const S: Record<string, { cls: string; Icon: React.ElementType }> = {
  DONE: { cls: "bg-green-500/10 text-green-500 border-green-500/20", Icon: CheckCircle2 },
  FAILED: { cls: "bg-red-500/10 text-red-500 border-red-500/20", Icon: XCircle },
  SCRAPING: { cls: "bg-blue-500/10 text-blue-500 border-blue-500/20", Icon: Loader2 },
  PENDING: { cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", Icon: Clock },
  QUEUED: { cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", Icon: Clock },
  RUNNING: { cls: "bg-blue-500/10 text-blue-500 border-blue-500/20", Icon: Loader2 },
};

export function ProjectDetail({ project, baseUrl }: { project: Project; baseUrl: string }) {
  const [rescraping, setRescraping] = useState(false);
  const router = useRouter();
  const dataset = project.datasets[0];
  const items: Record<string, unknown>[] = Array.isArray(dataset?.jsonData)
    ? (dataset.jsonData as Record<string, unknown>[])
    : dataset?.jsonData ? [dataset.jsonData as Record<string, unknown>] : [];
  const schema = Array.isArray(dataset?.schemaData) ? (dataset.schemaData as Record<string, unknown>[]) : [];
  const ps = S[project.status] ?? S.PENDING;
  const apiBase = `${baseUrl}/api/projects/${project.id}`;

  const rescrape = async () => {
    setRescraping(true);
    try {
      const res = await fetch("/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: project.id, url: project.websiteUrl }) });
      if (!res.ok) throw new Error("Failed");
      toast.success("Scrape started!");
      setTimeout(() => { router.refresh(); }, 2000);
    } catch { toast.error("Failed to start scrape"); }
    finally { setRescraping(false); }
  };

  const exportData = (fmt: "json" | "csv" | "md" | "openapi") => {
    if (!dataset) { toast.error("No data to export"); return; }
    let content = ""; let filename = ""; let type = "";
    if (fmt === "json") { content = JSON.stringify(items, null, 2); filename = `${project.name}.json`; type = "application/json"; }
    else if (fmt === "csv") { content = jsonToCsv(items); filename = `${project.name}.csv`; type = "text/csv"; }
    else if (fmt === "md") { content = dataset.markdownData ?? JSON.stringify(items, null, 2); filename = `${project.name}.md`; type = "text/markdown"; }
    else { content = JSON.stringify(buildOpenApiSpec(project.id, project.name, baseUrl, schema), null, 2); filename = `${project.name}-openapi.json`; type = "application/json"; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
    toast.success(`Exported as ${fmt.toUpperCase()}`);
  };

  const copy = (text: string, label = "Copied!") => { navigator.clipboard.writeText(text); toast.success(label); };

  const ENDPOINTS = [
    { path: "/data", desc: "Paginated data", params: "?page=1&limit=20" },
    { path: "/search", desc: "Full-text search", params: "?q=your+query" },
    { path: "/schema", desc: "JSON schema", params: "" },
    { path: "/docs", desc: "OpenAPI spec", params: "" },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold truncate">{project.name}</h1>
              <Badge variant="outline" className={`gap-1 text-xs ${ps.cls}`}>
                <ps.Icon className={`h-3 w-3 ${project.status === "SCRAPING" ? "animate-spin" : ""}`} />
                {project.status}
              </Badge>
            </div>
            <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate mt-0.5">
              {project.websiteUrl} <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button variant="outline" size="sm" onClick={rescrape} disabled={rescraping || project.status === "SCRAPING"} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${rescraping ? "animate-spin" : ""}`} />
            Re-scrape
          </Button>
          {(["json","csv","md","openapi"] as const).map((f) => (
            <Button key={f} variant="outline" size="sm" onClick={() => exportData(f)} disabled={!dataset} className="text-xs px-2">
              .{f}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Pages", v: project.scrapeJobs.reduce((s, j) => s + j.pagesScraped, 0), icon: Globe },
          { l: "Data Size", v: formatBytes(dataset?.sizeBytes ?? 0), icon: Database },
          { l: "Endpoints", v: project.generatedApis.length, icon: Code2 },
          { l: "Jobs Run", v: project.scrapeJobs.length, icon: Cpu },
        ].map((st) => (
          <Card key={st.l}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <st.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{st.l}</span>
              </div>
              <p className="text-xl font-bold">{st.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="data">
        <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-grid">
          <TabsTrigger value="data" className="gap-1.5 text-xs"><Database className="h-3.5 w-3.5" />Data</TabsTrigger>
          <TabsTrigger value="apis" className="gap-1.5 text-xs"><Code2 className="h-3.5 w-3.5" />APIs</TabsTrigger>
          <TabsTrigger value="jobs" className="gap-1.5 text-xs"><Cpu className="h-3.5 w-3.5" />Jobs</TabsTrigger>
          <TabsTrigger value="docs" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Docs</TabsTrigger>
        </TabsList>

        {/* DATA */}
        <TabsContent value="data">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Extracted Data {items.length > 0 && <span className="text-xs text-muted-foreground font-normal ml-2">({items.length} items)</span>}</CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => exportData("json")} className="text-xs gap-1.5 px-2"><Download className="h-3 w-3" />JSON</Button>
                <Button size="sm" variant="outline" onClick={() => exportData("csv")} className="text-xs gap-1.5 px-2"><Download className="h-3 w-3" />CSV</Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {project.status === "SCRAPING" ? "Scraping in progress…" : "No data yet"}
                  </p>
                  {project.status !== "SCRAPING" && (
                    <Button onClick={rescrape} size="sm" className="gradient-brand text-white border-0 gap-1.5">
                      <Play className="h-3.5 w-3.5" />Start Scraping
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  <pre className="json-view text-sm bg-muted/30 rounded-xl p-4 overflow-auto max-h-96 text-green-400">
                    {JSON.stringify(items.slice(0, 5), null, 2)}
                  </pre>
                  {items.length > 5 && <p className="text-xs text-muted-foreground mt-2 text-center">Showing 5 of {items.length} items — export for full dataset</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* APIS */}
        <TabsContent value="apis">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Generated REST Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.generatedApis.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">Scrape the site first to generate APIs</div>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400">
                    Include <code className="bg-yellow-500/10 px-1 py-0.5 rounded font-mono">X-API-Key: YOUR_KEY</code> header in all requests
                  </div>
                  {ENDPOINTS.map((ep) => (
                    <div key={ep.path} className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">GET</Badge>
                          <code className="text-sm font-mono">{ep.path}</code>
                          <span className="text-xs text-muted-foreground">{ep.desc}</span>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copy(`${apiBase}${ep.path}${ep.params}`, "Endpoint copied!")}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg">
                        <code className="text-xs font-mono text-blue-400 flex-1 truncate">{apiBase}{ep.path}{ep.params}</code>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* JOBS */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Scrape History</CardTitle></CardHeader>
            <CardContent>
              {project.scrapeJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No jobs yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-xs text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium">Engine</th>
                        <th className="text-left py-2 pr-4 font-medium">Status</th>
                        <th className="text-left py-2 pr-4 font-medium">Pages</th>
                        <th className="text-left py-2 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.scrapeJobs.map((job) => {
                        const js = S[job.status] ?? S.PENDING;
                        return (
                          <tr key={job.id} className="border-b border-border/40 hover:bg-muted/20">
                            <td className="py-3 pr-4"><span className="font-mono text-xs text-purple-400">{job.engine}</span></td>
                            <td className="py-3 pr-4">
                              <Badge variant="outline" className={`text-xs gap-1 ${js.cls}`}>
                                <js.Icon className={`h-3 w-3 ${job.status === "RUNNING" || job.status === "SCRAPING" ? "animate-spin" : ""}`} />
                                {job.status}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-xs">{job.pagesScraped}</td>
                            <td className="py-3 text-xs text-muted-foreground">{timeAgo(job.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCS */}
        <TabsContent value="docs">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">API Documentation</CardTitle>
              <Button size="sm" variant="outline" onClick={() => exportData("openapi")} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />OpenAPI Spec
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Base URL</p>
                <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl">
                  <code className="text-sm font-mono text-indigo-400 flex-1 truncate">{apiBase}</code>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copy(apiBase, "Base URL copied!")}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {ENDPOINTS.map((ep) => (
                  <div key={ep.path} className="p-4 rounded-xl border border-border/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">GET</Badge>
                      <code className="text-sm font-mono font-semibold">{ep.path}</code>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{ep.desc}</p>
                    <pre className="text-xs font-mono p-2 bg-muted/40 rounded-lg text-blue-300 overflow-x-auto">{`curl "${apiBase}${ep.path}${ep.params}" \\
  -H "X-API-Key: YOUR_KEY"`}</pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
