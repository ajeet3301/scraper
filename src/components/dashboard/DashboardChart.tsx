"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/index";

// Generate last 7 days labels
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en", { weekday: "short" });
  });
}

export function DashboardChart({ userId }: { userId: string }) {
  const [data, setData] = useState<{ date: string; jobs: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((d) => {
        setData(d.dailyJobs ?? last7Days().map((date) => ({ date, jobs: 0 })));
        setStatusData(d.statusCounts ?? []);
      })
      .catch(() => {
        setData(last7Days().map((date) => ({ date, jobs: 0 })));
      });
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    DONE: "#22c55e", FAILED: "#ef4444", PENDING: "#f59e0b", SCRAPING: "#3b82f6", SCHEDULED: "#8b5cf6",
  };

  const hasData = data.some((d) => d.jobs > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Job Activity (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
              Start scraping to see activity here
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="jobs" stroke="#6366f1" strokeWidth={2} fill="url(#g)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">No projects yet</div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {statusData.map((e) => <Cell key={e.name} fill={STATUS_COLORS[e.name] ?? "#6366f1"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map((e) => (
                  <div key={e.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[e.name] ?? "#6366f1" }} />
                      <span className="text-muted-foreground">{e.name}</span>
                    </div>
                    <span className="font-medium">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
