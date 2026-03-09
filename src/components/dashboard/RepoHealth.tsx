import { useRepo } from "@/context/RepoContext";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";

export default function RepoHealth() {
  const { repoData } = useRepo();
  if (!repoData) return null;

  const m = repoData.metadata;
  const lastPush = new Date(m.pushed_at);
  const daysSincePush = Math.floor((Date.now() - lastPush.getTime()) / (1000 * 60 * 60 * 24));

  const indicators = [
    { label: "Last commit", good: daysSincePush < 365, detail: daysSincePush < 365 ? `${daysSincePush} days ago` : `${daysSincePush} days ago (stale)` },
    { label: "Open issues", good: m.open_issues_count < 100, detail: `${m.open_issues_count} open issues` },
    { label: "Contributors", good: repoData.contributors.length > 2, detail: `${repoData.contributors.length} contributors` },
    { label: "License", good: !!m.license, detail: m.license?.spdx_id || "No license" },
    { label: "Description", good: !!m.description, detail: m.description ? "Present" : "Missing" },
  ];

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-heading font-semibold">Repository Health</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {indicators.map((ind) => (
          <div key={ind.label} className="p-3 rounded-lg bg-surface flex items-start gap-2">
            {ind.good ? (
              <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold">{ind.label}</p>
              <p className="text-xs text-muted-foreground">{ind.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
