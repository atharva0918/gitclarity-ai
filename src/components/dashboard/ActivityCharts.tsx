import { useRepo } from "@/context/RepoContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

export default function ActivityCharts() {
  const { repoData } = useRepo();
  if (!repoData) return null;

  const commitsByDate: Record<string, number> = {};
  repoData.commits.forEach((c: any) => {
    const date = new Date(c.commit?.author?.date || c.commit?.committer?.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    commitsByDate[date] = (commitsByDate[date] || 0) + 1;
  });
  const commitData = Object.entries(commitsByDate).reverse().map(([date, count]) => ({ date, commits: count }));

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold">Commit Activity</h2>
      </div>
      {commitData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={commitData}>
            <XAxis dataKey="date" tick={{ fill: "hsl(0,0%,69%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(0,0%,69%)", fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "hsl(0,0%,5%)", border: "1px solid hsl(0,0%,13%)", borderRadius: 8, color: "#fff" }}
            />
            <Line type="monotone" dataKey="commits" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-muted-foreground">No commit data available.</p>
      )}
    </div>
  );
}
