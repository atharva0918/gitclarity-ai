import { useRepo } from "@/context/RepoContext";
import { Compass, FileText, AlertCircle, Terminal, ExternalLink } from "lucide-react";

export default function BestFirstSteps() {
  const { repoData } = useRepo();
  if (!repoData) return null;

  const { owner, repo } = repoData;
  const steps = [
    {
      icon: FileText,
      title: "Read the README",
      description: "Start with the project's overview, goals, and basic usage.",
      href: `https://github.com/${owner}/${repo}#readme`,
      cta: "Open README",
    },
    {
      icon: AlertCircle,
      title: "Check open issues",
      description: "Browse beginner-friendly issues to find a good entry point.",
      href: `https://github.com/${owner}/${repo}/issues`,
      cta: "View Issues",
    },
    {
      icon: Terminal,
      title: "Run the project locally",
      description: "Clone the repo and follow the setup steps below to test it.",
      href: `https://github.com/${owner}/${repo}`,
      cta: "Open Repo",
    },
  ];

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold">Best First Steps</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        New to this repo? Follow these steps to get oriented quickly.
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <a
            key={i}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg bg-surface border border-border card-hover group flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-md bg-background flex items-center justify-center">
                <s.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">Step {i + 1}</span>
            </div>
            <p className="font-heading font-semibold text-sm mb-1">{s.title}</p>
            <p className="text-xs text-muted-foreground flex-1">{s.description}</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {s.cta} <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
