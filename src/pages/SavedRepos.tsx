import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRepo } from "@/context/RepoContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Bookmark, ExternalLink, Trash2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SavedRepo {
  id: string;
  repo_owner: string;
  repo_name: string;
  github_repo_link: string;
  description: string | null;
  user_understanding: string;
  future_task: string;
  created_at: string;
}

export default function SavedRepos() {
  const { user, loading: authLoading } = useAuth();
  const { analyzeRepo } = useRepo();
  const navigate = useNavigate();
  const [items, setItems] = useState<SavedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/"); return; }
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("saved_repositories")
        .select("id, repo_owner, repo_name, github_repo_link, description, user_understanding, future_task, created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setItems(data ?? []);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("saved_repositories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast.success("Removed");
  };

  const handleOpen = async (item: SavedRepo) => {
    setOpening(item.id);
    const ok = await analyzeRepo(item.repo_owner, item.repo_name);
    setOpening(null);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        <div className="flex items-center gap-2 mb-8">
          <Bookmark className="h-5 w-5" />
          <h1 className="text-2xl font-heading font-bold">Saved Repositories</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-xl bg-card">
            <p className="text-muted-foreground text-sm">No saved repositories yet.</p>
            <button onClick={() => navigate("/")} className="mt-4 text-sm text-foreground underline">Analyze a repository</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card p-5 card-hover flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-heading font-semibold truncate">{item.repo_name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{item.repo_owner}</p>
                  </div>
                  <a href={item.github_repo_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Open on GitHub">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>}

                <div className="space-y-2 text-xs flex-1">
                  <div>
                    <p className="text-muted-foreground/70 mb-0.5">Your Understanding</p>
                    <p className="line-clamp-2 text-foreground/90">{item.user_understanding}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/70 mb-0.5">Future Task</p>
                    <p className="line-clamp-2 text-foreground/90">{item.future_task}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">Saved {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpen(item)} disabled={opening === item.id}
                      className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90 inline-flex items-center gap-1 disabled:opacity-50">
                      {opening === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                      Open
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 flex items-center justify-center" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
