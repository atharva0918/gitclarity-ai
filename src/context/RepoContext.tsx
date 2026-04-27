import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RepoData {
  owner: string;
  repo: string;
  metadata: any;
  languages: Record<string, number>;
  contributors: any[];
  commits: any[];
  issues: any[];
  pulls: any[];
  tree: any[];
  readme: string;
  aiSummary: string;
}

interface RepoContextType {
  repoData: RepoData | null;
  isLoading: boolean;
  error: string | null;
  loadingStatus: string;
  analyzeRepo: (owner: string, repo: string) => Promise<boolean>;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

async function fetchEndpoint(owner: string, repo: string, endpoint: string) {
  const { data, error } = await supabase.functions.invoke("github-proxy", {
    body: { owner, repo, endpoint },
  });
  if (error) throw new Error(error.message || `Failed to fetch ${endpoint}`);
  if (data?.error) throw new Error(data.error);
  return data;
}

async function fetchAISummary(repoContext: string): Promise<string> {
  const body = {
    messages: [{ role: "user", content: "Provide a concise summary of this repository in 3-4 paragraphs. Cover: what it does, key technologies, and how it's structured." }],
    repoContext,
  };

  // Retry up to 3 times with exponential backoff to handle transient gateway hiccups
  let lastErr: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke("groq-chat", { body });
      if (error) { lastErr = error; }
      else if (data?.error) { lastErr = new Error(data.error); }
      else if (data?.content && typeof data.content === "string" && data.content.trim().length > 0) {
        return data.content;
      } else {
        lastErr = new Error("Empty AI response");
      }
    } catch (e) {
      lastErr = e;
    }
    // Backoff: 800ms, 1600ms
    if (attempt < 2) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  console.error("AI summary failed after retries:", lastErr);
  return "Unable to generate AI summary right now. Please try analyzing the repository again in a moment.";
}

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState("");

  const analyzeRepo = useCallback(async (owner: string, repo: string) => {
    setIsLoading(true);
    setError(null);
    setRepoData(null);

    try {
      setLoadingStatus("Fetching repository metadata...");
      const metadata = await fetchEndpoint(owner, repo, "repo");

      setLoadingStatus("Analyzing language distribution...");
      const [languages, contributors] = await Promise.all([
        fetchEndpoint(owner, repo, "languages"),
        fetchEndpoint(owner, repo, "contributors").catch(() => []),
      ]);

      setLoadingStatus("Loading commit history...");
      const [commits, issues, pulls] = await Promise.all([
        fetchEndpoint(owner, repo, "commits").catch(() => []),
        fetchEndpoint(owner, repo, "issues").catch(() => []),
        fetchEndpoint(owner, repo, "pulls").catch(() => []),
      ]);

      setLoadingStatus("Mapping file structure...");
      let tree: any[] = [];
      try {
        const treeData = await fetchEndpoint(owner, repo, "tree");
        tree = treeData?.tree || [];
      } catch { /* optional */ }

      setLoadingStatus("Reading README...");
      let readme = "";
      try {
        const readmeData = await fetchEndpoint(owner, repo, "readme");
        readme = atob(readmeData.content || "");
      } catch { /* optional */ }

      setLoadingStatus("Generating AI summary...");
      const repoContext = `Repository: ${metadata.full_name}
Description: ${metadata.description || "No description"}
Stars: ${metadata.stargazers_count}, Forks: ${metadata.forks_count}
Languages: ${Object.entries(languages).map(([k, v]) => `${k}: ${v}`).join(", ")}
Top contributors: ${(contributors as any[]).slice(0, 5).map((c: any) => c.login).join(", ")}
Recent commits: ${(commits as any[]).slice(0, 5).map((c: any) => c.commit?.message?.split("\n")[0]).join("; ")}
README (first 2000 chars): ${readme.slice(0, 2000)}`;

      const aiSummary = await fetchAISummary(repoContext);

      setRepoData({
        owner, repo, metadata, languages,
        contributors: contributors || [],
        commits: commits || [],
        issues: issues || [],
        pulls: pulls || [],
        tree, readme, aiSummary,
      });

      // Log analysis history (best effort, ignore failures)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("analysis_history").insert({
            user_id: user.id,
            repo_owner: owner,
            repo_name: repo,
            github_repo_link: metadata.html_url,
            description: metadata.description ?? "",
            stars: metadata.stargazers_count ?? 0,
            forks: metadata.forks_count ?? 0,
            open_issues: metadata.open_issues_count ?? 0,
            ai_summary: aiSummary ?? "",
          });
        }
      } catch { /* ignore */ }

      setIsLoading(false);
      setLoadingStatus("");
      return true;
    } catch (e: any) {
      setError(e.message || "Failed to analyze repository");
      setIsLoading(false);
      setLoadingStatus("");
      return false;
    }
  }, []);

  return (
    <RepoContext.Provider value={{ repoData, isLoading, error, loadingStatus, analyzeRepo }}>
      {children}
    </RepoContext.Provider>
  );
}

export function useRepo() {
  const ctx = useContext(RepoContext);
  if (!ctx) throw new Error("useRepo must be used within RepoProvider");
  return ctx;
}
