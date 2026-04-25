import { useRepo } from "@/context/RepoContext";
import { Code } from "lucide-react";

const COLORS = ["#EC4899", "#EF4444", "#06B6D4", "#F59E0B", "#3B82F6", "#8B5CF6", "#10B981", "#9CA3AF"];

export default function LanguageChart() {
  const { repoData } = useRepo();
  if (!repoData) return null;

  const total = Object.values(repoData.languages).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-heading font-semibold">Technology Stack</h2>
        </div>
        <p className="text-sm text-muted-foreground">No language data available.</p>
      </div>
    );
  }

  const entries = Object.entries(repoData.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value], i) => ({
      name,
      value,
      pct: (value / total) * 100,
      color: COLORS[i % COLORS.length],
    }));

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center gap-2 mb-5">
        <Code className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold">Technology Stack</h2>
      </div>

      {/* Stacked horizontal bar */}
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-surface mb-5">
        {entries.map((e) => (
          <div
            key={e.name}
            style={{ width: `${e.pct}%`, backgroundColor: e.color }}
            title={`${e.name} ${e.pct.toFixed(1)}%`}
            className="h-full transition-all hover:opacity-80"
          />
        ))}
      </div>

      {/* Legend grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
        {entries.map((e) => (
          <div key={e.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: e.color }}
            />
            <span className="font-medium text-foreground">{e.name}</span>
            <span className="text-muted-foreground">{e.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
