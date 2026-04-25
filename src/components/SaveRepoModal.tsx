import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useRepo } from "@/context/RepoContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SaveRepoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SaveRepoModal({ open, onOpenChange }: SaveRepoModalProps) {
  const { user } = useAuth();
  const { repoData } = useRepo();
  const [understanding, setUnderstanding] = useState("");
  const [futureTask, setFutureTask] = useState("");
  const [saving, setSaving] = useState(false);

  if (!repoData) return null;
  const m = repoData.metadata;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("You must be logged in"); return; }
    if (!understanding.trim() || !futureTask.trim()) {
      toast.error("Please fill in both fields"); return;
    }
    setSaving(true);
    const { error } = await supabase.from("saved_repositories").insert({
      user_id: user.id,
      repo_owner: repoData.owner,
      repo_name: repoData.repo,
      github_repo_link: m.html_url,
      description: m.description ?? "",
      stars: m.stargazers_count ?? 0,
      forks: m.forks_count ?? 0,
      open_issues: m.open_issues_count ?? 0,
      contributors: repoData.contributors.length,
      ai_summary: repoData.aiSummary ?? "",
      user_understanding: understanding.trim(),
      future_task: futureTask.trim(),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Repository saved successfully");
    setUnderstanding(""); setFutureTask("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Save Repository</DialogTitle>
          <DialogDescription>Add your notes and save this repository to your collection.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border p-4 space-y-2 text-sm bg-background/50">
          <div className="flex items-center justify-between gap-4">
            <div className="font-heading font-semibold">{m.full_name}</div>
            <a href={m.html_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> GitHub
            </a>
          </div>
          {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
            <span>★ {m.stargazers_count?.toLocaleString()}</span>
            <span>⑂ {m.forks_count?.toLocaleString()}</span>
            <span>⊙ {m.open_issues_count?.toLocaleString()} issues</span>
            <span>👤 {repoData.contributors.length} contributors</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Your Understanding *</label>
            <textarea
              required value={understanding} onChange={(e) => setUnderstanding(e.target.value)}
              placeholder="What did you understand about this repository?"
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Future Task / Plan *</label>
            <textarea
              required value={futureTask} onChange={(e) => setFutureTask(e.target.value)}
              placeholder="What do you plan to do with this repository?"
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>
          <button type="submit" disabled={saving}
            className="w-full h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Repository
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
