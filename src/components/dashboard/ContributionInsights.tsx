import { useRepo } from "@/context/RepoContext";
import { GitCommit, GitPullRequest, CircleDot, ExternalLink } from "lucide-react";

export default function ContributionInsights() {
  const { repoData } = useRepo();
  if (!repoData) return null;

  const recentCommits = repoData.commits.slice(0, 5);
  const recentPRs = repoData.pulls.slice(0, 5);
  const goodFirstIssues = repoData.issues.filter((i: any) => i.labels?.some((l: any) => l.name === "good first issue")).slice(0, 5);

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <h2 className="text-lg font-heading font-semibold mb-4">Contribution Insights</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Commits */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
            <GitCommit className="h-4 w-4" /> Recent Commits
          </h3>
          <div className="space-y-2">
            {recentCommits.map((c: any) => (
              <a key={c.sha} href={c.html_url} target="_blank" rel="noopener noreferrer" className="block p-2.5 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                <p className="text-xs font-mono truncate">{c.commit?.message?.split("\n")[0]}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.commit?.author?.name} · {new Date(c.commit?.author?.date).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        </div>

        {/* PRs */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
            <GitPullRequest className="h-4 w-4" /> Pull Requests
          </h3>
          <div className="space-y-2">
            {recentPRs.length > 0 ? recentPRs.map((p: any) => (
              <a key={p.id} href={p.html_url} target="_blank" rel="noopener noreferrer" className="block p-2.5 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                <p className="text-xs truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.user?.login} · {p.state}</p>
              </a>
            )) : <p className="text-xs text-muted-foreground">No pull requests found.</p>}
          </div>
        </div>

        {/* Good First Issues */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
            <CircleDot className="h-4 w-4" /> Good First Issues
          </h3>
          <div className="space-y-2">
            {goodFirstIssues.length > 0 ? goodFirstIssues.map((i: any) => (
              <a key={i.id} href={i.html_url} target="_blank" rel="noopener noreferrer" className="block p-2.5 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                <p className="text-xs truncate">{i.title}</p>
                <p className="text-xs text-muted-foreground mt-1">#{i.number} · {i.state}</p>
              </a>
            )) : <p className="text-xs text-muted-foreground">No good first issues found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
