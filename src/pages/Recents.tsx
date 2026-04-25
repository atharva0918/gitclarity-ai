import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Clock, ExternalLink, Loader2, ChevronDown, ChevronUp, Star, GitFork, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

interface HistoryItem {
  id: string;
  repo_owner: string;
  repo_name: string;
  github_repo_link: string;
  description: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  ai_summary: string | null;
  analyzed_at: string;
}

export default function Recents() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/"); return; }
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .order("analyzed_at", { ascending: false })
        .limit(100);
      if (error) toast.error(error.message);
      else setItems(data ?? []);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <div className="flex items-center gap-2 mb-8">
          <Clock className="h-5 w-5" />
          <h1 className="text-2xl font-heading font-bold">Recents</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-xl bg-card">
            <p className="text-muted-foreground text-sm">No analysis history yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold truncate">{item.repo_owner}/{item.repo_name}</h3>
                        <a href={item.github_repo_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground shrink-0" aria-label="GitHub">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      {item.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" />{item.stars.toLocaleString()}</span>
                        <span className="inline-flex items-center gap-1"><GitFork className="h-3 w-3" />{item.forks.toLocaleString()}</span>
                        <span className="inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" />{item.open_issues.toLocaleString()}</span>
                        <span>· {formatDistanceToNow(new Date(item.analyzed_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <button onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="h-8 px-3 rounded-md border border-border text-xs hover:bg-accent inline-flex items-center gap-1 shrink-0">
                      {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {isOpen ? "Hide" : "Show"} Summary
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 border-t border-border">
                      <div className="prose prose-sm prose-invert max-w-none text-sm text-muted-foreground pt-3">
                        {item.ai_summary ? <ReactMarkdown>{item.ai_summary}</ReactMarkdown> : <p>No summary available.</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
