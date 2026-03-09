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

async function fetchAISummary(repoContext: string) {
  const { data, error } = await supabase.functions.invoke("groq-chat", {
    body: {
      messages: [{ role: "user", content: "Provide a concise summary of this repository in 3-4 paragraphs. Cover: what it does, key technologies, and how it's structured." }],
      repoContext,
    },
  });
  if (error) return "Unable to generate AI summary.";
  return data?.content || "No summary available.";
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
