import { useRepo } from "@/context/RepoContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity } from "lucide-react";
import { useMemo } from "react";

export default function ActivityCharts() {
  const { repoData } = useRepo();

  const commitData = useMemo(() => {
    if (!repoData) return [];
    const byMonth: Record<string, { count: number; sortKey: string }> = {};
    repoData.commits.forEach((c: any) => {
      const raw = c.commit?.author?.date || c.commit?.committer?.date;
      if (!raw) return;
      const d = new Date(raw);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!byMonth[label]) byMonth[label] = { count: 0, sortKey };
      byMonth[label].count += 1;
    });
    return Object.entries(byMonth)
      .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
      .map(([month, v]) => ({ month, commits: v.count }));
  }, [repoData?.commits]);

  if (!repoData) return null;

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in h-full">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold">Commit Activity</h2>
        <span className="text-xs text-muted-foreground">(per month)</span>
      </div>
      {commitData.length > 0 ? (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={commitData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="hsl(0,0%,13%)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,69%)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "hsl(0,0%,13%)" }} />
            <YAxis tick={{ fill: "hsl(0,0%,69%)", fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(0,0%,5%)", border: "1px solid hsl(0,0%,13%)", borderRadius: 8, color: "#fff" }}
              labelStyle={{ color: "#fff" }}
            />
            <Line type="monotone" dataKey="commits" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6", r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-muted-foreground">No commit data available.</p>
      )}
    </div>
  );
}
