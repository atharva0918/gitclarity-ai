import { useRepo } from "@/context/RepoContext";
import { Star, GitFork, Eye, AlertCircle, Users, Clock, ExternalLink, RefreshCw } from "lucide-react";

export default function RepoOverview() {
  const { repoData, analyzeRepo } = useRepo();
  if (!repoData) return null;
  const m = repoData.metadata;

  const metrics = [
    { icon: Star, label: "Stars", value: m.stargazers_count?.toLocaleString() },
    { icon: GitFork, label: "Forks", value: m.forks_count?.toLocaleString() },
    { icon: Eye, label: "Watchers", value: m.watchers_count?.toLocaleString() },
    { icon: AlertCircle, label: "Issues", value: m.open_issues_count?.toLocaleString() },
    { icon: Users, label: "Contributors", value: repoData.contributors.length },
    { icon: Clock, label: "Last Push", value: m.pushed_at ? new Date(m.pushed_at).toLocaleDateString() : "N/A" },
  ];

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <img src={m.owner?.avatar_url} alt={m.owner?.login} className="h-12 w-12 rounded-lg border border-border" />
          <div>
            <h1 className="text-2xl font-heading font-bold">{m.full_name}</h1>
            {m.description && <p className="text-muted-foreground mt-1 text-sm max-w-2xl">{m.description}</p>}
            {m.topics?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {m.topics.slice(0, 8).map((t: string) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-accent text-foreground text-xs font-mono">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => analyzeRepo(repoData.owner, repoData.repo)}
            className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <a
            href={m.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded-lg bg-foreground text-background text-sm inline-flex items-center gap-2 hover:bg-foreground/90 transition-colors whitespace-nowrap"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" /> Open on GitHub
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="p-3 rounded-lg bg-surface text-center">
            <m.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-heading font-bold">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
