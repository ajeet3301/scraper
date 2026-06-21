"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from "@/components/ui/index";
import { Loader2, Play, FlaskConical, Copy } from "lucide-react";
import { toast } from "sonner";

interface Project { id: string; name: string }
interface ApiKeyData { key: string; name: string }

const ENDPOINTS = [
  { label: "Get all data", path: "/data" },
  { label: "Search", path: "/search?q=" },
  { label: "Get schema", path: "/schema" },
  { label: "OpenAPI docs", path: "/docs" },
];

export function PlaygroundClient({ projects, apiKeys }: { projects: Project[]; apiKeys: ApiKeyData[] }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [path, setPath] = useState(ENDPOINTS[0].path);
  const [custom, setCustom] = useState("");
  const [apiKey, setApiKey] = useState(apiKeys[0]?.key ?? "");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [ms, setMs] = useState<number | null>(null);

  const fullUrl = `/api/projects/${projectId}${custom || path}`;

  const send = async () => {
    if (!projectId) { toast.error("Select a project first"); return; }
    setLoading(true); setResponse(""); setStatus(null);
    const t0 = Date.now();
    try {
      const res = await fetch(fullUrl, { headers: { "X-API-Key": apiKey } });
      setMs(Date.now() - t0);
      setStatus(res.status);
      const text = await res.text();
      try { setResponse(JSON.stringify(JSON.parse(text), null, 2)); } catch { setResponse(text); }
    } catch (e) { setResponse(String(e)); setStatus(0); }
    finally { setLoading(false); }
  };

  const copyResponse = () => { navigator.clipboard.writeText(response); toast.success("Copied!"); };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="h-6 w-6 text-indigo-500" />API Playground</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Test your generated API endpoints live</p>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">No completed projects yet. Scrape a site first.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Request Builder</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Endpoint</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ENDPOINTS.map((ep) => (
                    <button key={ep.path} onClick={() => { setPath(ep.path); setCustom(""); }}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-colors ${path === ep.path && !custom ? "border-indigo-500/40 bg-indigo-500/5 text-indigo-400" : "border-border/60 hover:bg-muted/40"}`}>
                      <span className="font-mono block mb-0.5">{ep.path}</span>
                      <span className="text-muted-foreground">{ep.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Custom path (optional)</Label>
                <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="/data?page=1&limit=5" className="font-mono text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label>API Key</Label>
                {apiKeys.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Create a key in Settings first</p>
                ) : (
                  <Select value={apiKey} onValueChange={setApiKey}>
                    <SelectTrigger><SelectValue placeholder="Select key" /></SelectTrigger>
                    <SelectContent>{apiKeys.map((k) => <SelectItem key={k.key} value={k.key}>{k.name}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
              <div className="p-3 bg-muted/40 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">GET</Badge>
                  <span className="text-xs text-muted-foreground">Request URL</span>
                </div>
                <code className="text-xs font-mono break-all text-blue-400">{fullUrl}</code>
              </div>
              <Button onClick={send} disabled={loading || !projectId} className="w-full gradient-brand text-white border-0 hover:opacity-90 gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : <><Play className="h-4 w-4" />Send Request</>}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Response</CardTitle>
              <div className="flex items-center gap-2">
                {status !== null && <Badge variant="outline" className={status >= 200 && status < 300 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}>{status}</Badge>}
                {ms !== null && <span className="text-xs text-muted-foreground">{ms}ms</span>}
                {response && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyResponse}><Copy className="h-3.5 w-3.5" /></Button>}
              </div>
            </CardHeader>
            <CardContent>
              {!response && !loading ? (
                <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Send a request to see the response</div>
              ) : loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <pre className="json-view text-xs p-4 bg-muted/30 rounded-xl overflow-auto max-h-[500px] text-green-400">{response}</pre>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
