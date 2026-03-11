import { useRepo } from "@/context/RepoContext";
import { Play, ExternalLink } from "lucide-react";
import { useMemo } from "react";

const ENTRY_FILES = [
  "main.py", "app.py", "server.py", "manage.py",
  "index.js", "index.ts", "index.tsx", "app.js", "app.ts", "app.tsx",
  "server.js", "server.ts", "main.js", "main.ts", "main.tsx",
  "Program.cs", "Main.java", "main.go", "main.rs",
  "src/index.js", "src/index.ts", "src/index.tsx",
  "src/main.js", "src/main.ts", "src/main.tsx",
  "src/App.js", "src/App.ts", "src/App.tsx",
  "src/app.js", "src/app.ts", "src/app.tsx",
];

export default function EntryPoints() {
  const { repoData } = useRepo();

  const entries = useMemo(() => {
    if (!repoData?.tree.length) return [];
    return repoData.tree
      .filter((f: any) => f.type === "blob" && ENTRY_FILES.some(e => f.path === e || f.path.endsWith("/" + e)))
      .slice(0, 8);
  }, [repoData?.tree]);

  if (!repoData || entries.length === 0) return null;

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Play className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold">Start Reading the Code Here</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">These are the likely entry points for this project.</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {entries.map((f: any) => (
          <a
            key={f.path}
            href={`https://github.com/${repoData.owner}/${repoData.repo}/blob/main/${f.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors group"
          >
            <span className="font-mono text-xs">{f.path}</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}
