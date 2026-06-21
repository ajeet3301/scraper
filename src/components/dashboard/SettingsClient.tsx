"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Badge, Avatar, AvatarFallback, AvatarImage, Progress, Switch } from "@/components/ui/index";
import { Key, Plus, Copy, Trash2, Loader2, Eye, EyeOff, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";

interface ApiKey { id: string; name: string; key: string; usageCount: number; usageLimit: number; isActive: boolean; lastUsedAt: Date | null; createdAt: Date }
interface UserData { id: string; name: string | null; email: string; image: string | null; role: string; createdAt: Date }

export function SettingsClient({ user, apiKeys: initial }: { user: UserData; apiKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initial);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [name, setName] = useState(user.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [firecrawlKey, setFirecrawlKey] = useState("");
  const router = useRouter();

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  const createKey = async () => {
    if (!newKeyName.trim()) { toast.error("Enter a name for the key"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newKeyName }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const key = await res.json();
      setKeys((prev) => [key, ...prev]);
      setRevealed((prev) => new Set([...prev, key.id]));
      setNewKeyName("");
      toast.success("API key created — copy it now!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setCreating(false); }
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Revoke this API key?")) return;
    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    if (res.ok) { setKeys((prev) => prev.filter((k) => k.id !== id)); toast.success("Key revoked"); }
    else toast.error("Failed to revoke key");
  };

  const copyKey = (key: string) => { navigator.clipboard.writeText(key); toast.success("Copied!"); };
  const toggleReveal = (id: string) => setRevealed((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const mask = (k: string) => k.slice(0, 12) + "•".repeat(16) + k.slice(-4);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error("Failed");
      toast.success("Profile updated");
      router.refresh();
    } catch { toast.error("Failed to save"); }
    finally { setSavingProfile(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your profile and API keys</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-indigo-500" />Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="gradient-brand text-white text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name ?? "No name"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="text-xs mt-1">{user.role}</Badge>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Display Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <Button onClick={saveProfile} disabled={savingProfile || name === user.name} className="gradient-brand text-white border-0 hover:opacity-90">
            {savingProfile ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Firecrawl */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">🔥 Firecrawl API Key (Optional)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Add your Firecrawl key to scrape JavaScript-heavy sites (React, Vue, SPAs). Get a free key at <a href="https://firecrawl.dev" target="_blank" className="text-indigo-400 hover:underline">firecrawl.dev</a>.</p>
          <div className="space-y-1.5">
            <Label>Firecrawl API Key</Label>
            <Input value={firecrawlKey} onChange={(e) => setFirecrawlKey(e.target.value)} placeholder="fc-xxxxxxxxxxxxxxxx" type="password" />
          </div>
          <p className="text-xs text-muted-foreground">⚠️ Store your key securely. Add it as <code className="bg-muted px-1 rounded">FIRECRAWL_API_KEY</code> in your Vercel environment variables for server-side use.</p>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4 text-purple-500" />API Keys</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Use these keys in the <code className="text-xs bg-muted px-1 rounded">X-API-Key</code> header to access your generated APIs.</p>
          <div className="flex gap-2">
            <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name (e.g. Production)" onKeyDown={(e) => e.key === "Enter" && createKey()} />
            <Button onClick={createKey} disabled={creating} className="gradient-brand text-white border-0 hover:opacity-90 shrink-0 gap-1">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" />Create</>}
            </Button>
          </div>
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No API keys yet</p>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => {
                const pct = Math.round((k.usageCount / k.usageLimit) * 100);
                const isRevealed = revealed.has(k.id);
                return (
                  <div key={k.id} className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-medium text-sm truncate">{k.name}</p>
                        <Badge variant="outline" className={`text-xs ${k.isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                          {k.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleReveal(k.id)}>
                          {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyKey(k.key)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteKey(k.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <code className="text-xs font-mono block bg-muted/50 px-2 py-1.5 rounded-lg text-muted-foreground truncate">
                      {isRevealed ? k.key : mask(k.key)}
                    </code>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{k.usageCount.toLocaleString()} / {k.usageLimit.toLocaleString()} calls</span>
                      <span>{k.lastUsedAt ? `Last used ${timeAgo(k.lastUsedAt)}` : "Never used"}</span>
                    </div>
                    <Progress value={pct} className="h-1" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" />Security</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {["JWT sessions with secure httpOnly cookies", "All passwords hashed with bcrypt (12 rounds)", "Rate limiting on all API endpoints", "Input validation with Zod on every route"].map((t) => (
            <div key={t} className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />{t}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
