import { useRepo } from "@/context/RepoContext";
import { FolderTree, File, Folder, ChevronRight, ChevronDown, Search, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

interface TreeNode {
  name: string;
  path: string;
  type: "tree" | "blob";
  children: TreeNode[];
}

function buildTree(items: any[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map: Record<string, TreeNode> = {};

  items.forEach((item: any) => {
    const parts = item.path.split("/");
    let current = root;
    let fullPath = "";

    parts.forEach((part: string, i: number) => {
      fullPath = fullPath ? `${fullPath}/${part}` : part;
      if (!map[fullPath]) {
        const node: TreeNode = {
          name: part,
          path: fullPath,
          type: i === parts.length - 1 ? item.type : "tree",
          children: [],
        };
        map[fullPath] = node;
        current.push(node);
      }
      current = map[fullPath].children;
    });
  });

  return root;
}

const IMPORTANT_FILES = ["README.md", "package.json", "requirements.txt", "Dockerfile", "docker-compose.yml", "setup.py", "setup.cfg", "Makefile", "CONTRIBUTING.md"];

function TreeItem({ node, owner, repo, depth = 0 }: { node: TreeNode; owner: string; repo: string; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const isDir = node.type === "tree" || node.children.length > 0;
  const highlight = IMPORTANT_FILES.includes(node.name);

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded text-sm cursor-pointer hover:bg-surface-hover transition-colors ${highlight ? "text-foreground font-medium" : "text-muted-foreground"}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isDir && setOpen(!open)}
      >
        {isDir ? (
          open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        ) : <span className="w-3.5" />}
        {isDir ? <Folder className="h-3.5 w-3.5 shrink-0" /> : <File className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate font-mono text-xs">{node.name}</span>
        {!isDir && (
          <a
            href={`https://github.com/${owner}/${repo}/blob/main/${node.path}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto opacity-0 group-hover:opacity-100"
          >
            <ExternalLink className="h-3 w-3 hover:text-foreground" />
          </a>
        )}
      </div>
      {isDir && open && node.children.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "tree" ? -1 : 1)).map((child) => (
        <TreeItem key={child.path} node={child} owner={owner} repo={repo} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function FileTree() {
  const { repoData } = useRepo();
  const [search, setSearch] = useState("");

  const tree = useMemo(() => {
    if (!repoData?.tree.length) return [];
    const filtered = search
      ? repoData.tree.filter((f: any) => f.path.toLowerCase().includes(search.toLowerCase()))
      : repoData.tree;
    return buildTree(filtered.slice(0, 500));
  }, [repoData?.tree, search]);

  if (!repoData) return null;

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-heading font-semibold">Codebase Structure</h2>
          <span className="text-xs text-muted-foreground">({repoData.tree.length} files)</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="h-8 pl-8 pr-3 rounded-md bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 w-48"
          />
        </div>
      </div>
      <div className="max-h-96 overflow-auto rounded-lg bg-surface p-2">
        {tree.length > 0 ? (
          tree.map((node) => <TreeItem key={node.path} node={node} owner={repoData.owner} repo={repoData.repo} />)
        ) : (
          <p className="text-sm text-muted-foreground p-4">No files found.</p>
        )}
      </div>
    </div>
  );
}
