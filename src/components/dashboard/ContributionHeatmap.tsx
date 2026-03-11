import { useRepo } from "@/context/RepoContext";
import { Calendar } from "lucide-react";
import { useMemo } from "react";

export default function ContributionHeatmap() {
  const { repoData } = useRepo();

  const heatmapData = useMemo(() => {
    if (!repoData) return [];

    const dayMap: Record<string, number> = {};
    repoData.commits.forEach((c: any) => {
      const d = new Date(c.commit?.author?.date || c.commit?.committer?.date);
      const key = d.toISOString().split("T")[0];
      dayMap[key] = (dayMap[key] || 0) + 1;
    });

    // Build last 12 weeks
    const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
    const today = new Date();
    for (let w = 11; w >= 0; w--) {
      const week: { date: string; count: number; dayOfWeek: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + (6 - d)));
        const key = date.toISOString().split("T")[0];
        week.push({ date: key, count: dayMap[key] || 0, dayOfWeek: d });
      }
      weeks.push(week);
    }
    return weeks;
  }, [repoData?.commits]);

  if (!repoData) return null;

  const maxCount = Math.max(1, ...heatmapData.flat().map(d => d.count));

  const getColor = (count: number) => {
    if (count === 0) return "bg-surface";
    const intensity = count / maxCount;
    if (intensity < 0.25) return "bg-[#0e4429]";
    if (intensity < 0.5) return "bg-[#006d32]";
    if (intensity < 0.75) return "bg-[#26a641]";
    return "bg-[#39d353]";
  };

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold">Contribution Patterns</h2>
        <span className="text-xs text-muted-foreground">(last 12 weeks)</span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {heatmapData.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors`}
                title={`${day.date}: ${day.count} commit${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-surface" />
        <div className="w-3 h-3 rounded-sm bg-[#0e4429]" />
        <div className="w-3 h-3 rounded-sm bg-[#006d32]" />
        <div className="w-3 h-3 rounded-sm bg-[#26a641]" />
        <div className="w-3 h-3 rounded-sm bg-[#39d353]" />
        <span>More</span>
      </div>
    </div>
  );
}
