import { useRepo } from "@/context/RepoContext";
import { Users, ExternalLink } from "lucide-react";

export default function TopContributors() {
  const { repoData } = useRepo();
  if (!repoData) return null;

  const totalContribs = repoData.contributors.reduce((a: number, c: any) => a + (c.contributions || 0), 0);
  const top = repoData.contributors.slice(0, 3);

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-heading font-semibold">Top Contributors</h2>
        </div>
        <a
          href={`https://github.com/${repoData.owner}/${repoData.repo}/graphs/contributors`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          View all <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {top.map((c: any) => {
          const pct = totalContribs > 0 ? ((c.contributions / totalContribs) * 100).toFixed(1) : "0";
          return (
            <div key={c.id} className="p-4 rounded-lg bg-surface border border-border card-hover text-center">
              <img src={c.avatar_url} alt={c.login} className="h-14 w-14 rounded-full mx-auto mb-3 ring-2 ring-border" />
              <p className="font-heading font-semibold text-sm">{c.login}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.contributions} contributions ({pct}%)</p>
              <a
                href={`https://github.com/${repoData.owner}/${repoData.repo}/graphs/contributors`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View Contributions <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
