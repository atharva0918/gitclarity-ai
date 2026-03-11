import { useRepo } from "@/context/RepoContext";
import { Lightbulb, Loader2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Idea {
  title: string;
  description: string;
  difficulty: string;
  files: string[];
  issueUrl?: string;
}

export default function ContributionIdeas() {
  const { repoData } = useRepo();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!repoData || loaded) return;
    generateIdeas();
  }, [repoData]);

  const generateIdeas = async () => {
    if (!repoData) return;
    setLoading(true);

    const repoContext = `Repository: ${repoData.metadata.full_name}
Description: ${repoData.metadata.description || "No description"}
Languages: ${Object.keys(repoData.languages).join(", ")}
Stars: ${repoData.metadata.stargazers_count}, Forks: ${repoData.metadata.forks_count}
Top files: ${repoData.tree.slice(0, 50).map((f: any) => f.path).join(", ")}
Open issues: ${repoData.issues.slice(0, 10).map((i: any) => `${i.title} (labels: ${i.labels?.map((l: any) => l.name).join(", ") || "none"})`).join("; ")}
Recent commits: ${repoData.commits.slice(0, 10).map((c: any) => c.commit?.message?.split("\n")[0]).join("; ")}
README (first 2000 chars): ${repoData.readme.slice(0, 2000)}`;

    try {
      const { data, error } = await supabase.functions.invoke("groq-chat", {
        body: {
          messages: [{ role: "user", content: "Analyze this repository and suggest 3-5 actionable contribution ideas." }],
          repoContext,
          mode: "contribution-ideas",
        },
      });
      if (error) throw error;

      try {
        const cleaned = (data.content || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        setIdeas(Array.isArray(parsed) ? parsed : parsed.suggestions || parsed.ideas || []);
      } catch {
        setIdeas([]);
      }
    } catch {
      setIdeas([]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  if (!repoData) return null;

  const difficultyColor = (d: string) => {
    const lower = d?.toLowerCase();
    if (lower === "beginner" || lower === "easy") return "text-[#10B981]";
    if (lower === "intermediate" || lower === "medium") return "text-[#F59E0B]";
    return "text-[#EF4444]";
  };

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold">Suggested Contribution Ideas</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating suggestions...
        </div>
      ) : ideas.length > 0 ? (
        <div className="space-y-3">
          {ideas.map((idea, i) => (
            <div key={i} className="p-4 rounded-lg bg-surface border border-border card-hover">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">{idea.title}</h3>
                {idea.difficulty && (
                  <span className={`text-xs font-mono shrink-0 ${difficultyColor(idea.difficulty)}`}>
                    {idea.difficulty}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{idea.description}</p>
              {idea.files?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {idea.files.map((f, fi) => (
                    <span key={fi} className="px-1.5 py-0.5 rounded bg-accent text-xs font-mono">{f}</span>
                  ))}
                </div>
              )}
              {idea.issueUrl && (
                <a href={idea.issueUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Related issue <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : loaded ? (
        <p className="text-sm text-muted-foreground py-4">No suggestions available for this repository.</p>
      ) : null}
    </div>
  );
}
