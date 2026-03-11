import { useRepo } from "@/context/RepoContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Code } from "lucide-react";

const COLORS = ["#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#EC4899", "#6366F1"];

export default function LanguageChart() {
  const { repoData } = useRepo();
  if (!repoData) return null;

  const total = Object.values(repoData.languages).reduce((a, b) => a + b, 0);
  const data = Object.entries(repoData.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value, pct: ((value / total) * 100).toFixed(1) }));

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Code className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold">Technology Stack</h2>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={{ fill: "hsl(0,0%,69%)", fontSize: 12 }} width={75} />
          <Tooltip
            contentStyle={{ background: "hsl(0,0%,5%)", border: "1px solid hsl(0,0%,13%)", borderRadius: 8, color: "#fff" }}
            formatter={(value: number) => [`${((value / total) * 100).toFixed(1)}%`, "Usage"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
