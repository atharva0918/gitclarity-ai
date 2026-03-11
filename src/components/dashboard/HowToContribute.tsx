import { useRepo } from "@/context/RepoContext";
import { BookOpen, Copy, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function HowToContribute() {
  const { repoData } = useRepo();

  const steps = useMemo(() => {
    if (!repoData) return [];
    const cmds: { label: string; command: string }[] = [];
    const { owner, repo, readme } = repoData;

    cmds.push({ label: "Clone the repository", command: `git clone https://github.com/${owner}/${repo}.git` });
    cmds.push({ label: "Navigate to the project", command: `cd ${repo}` });

    const lower = readme.toLowerCase();
    if (lower.includes("npm install") || lower.includes("package.json") || repoData.tree.some((f: any) => f.path === "package.json")) {
      cmds.push({ label: "Install dependencies", command: "npm install" });
    } else if (lower.includes("pip install") || repoData.tree.some((f: any) => f.path === "requirements.txt")) {
      cmds.push({ label: "Install dependencies", command: "pip install -r requirements.txt" });
    } else if (lower.includes("yarn")) {
      cmds.push({ label: "Install dependencies", command: "yarn" });
    }

    if (lower.includes("npm run dev") || lower.includes("npm start")) {
      cmds.push({ label: "Run the project", command: lower.includes("npm run dev") ? "npm run dev" : "npm start" });
    } else if (lower.includes("python")) {
      cmds.push({ label: "Run the project", command: "python main.py" });
    }

    cmds.push({ label: "Create a branch for your changes", command: "git checkout -b my-contribution" });

    return cmds;
  }, [repoData]);

  if (!repoData || steps.length === 0) return null;

  const copyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-heading font-semibold">How to Contribute</h2>
        </div>
        <a
          href={`https://github.com/${repoData.owner}/${repoData.repo}#readme`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          View README <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-surface flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-mono text-muted-foreground">{i + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm mb-1">{s.label}</p>
              <div className="flex items-center gap-2 p-2 rounded-md bg-surface group">
                <code className="text-xs font-mono text-muted-foreground flex-1">{s.command}</code>
                <button
                  onClick={() => copyCmd(s.command)}
                  className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
