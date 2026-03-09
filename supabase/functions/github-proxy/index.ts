import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { owner, repo, endpoint } = await req.json();
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

    if (!owner || !repo) {
      return new Response(JSON.stringify({ error: "owner and repo are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endpoints: Record<string, string> = {
      repo: `https://api.github.com/repos/${owner}/${repo}`,
      languages: `https://api.github.com/repos/${owner}/${repo}/languages`,
      contributors: `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=20`,
      commits: `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`,
      issues: `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=20`,
      pulls: `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=20`,
      tree: `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      readme: `https://api.github.com/repos/${owner}/${repo}/readme`,
    };

    const url = endpoints[endpoint];
    if (!url) {
      return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitClarity",
    };
    if (GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(url, { headers });

    if (response.status === 404) {
      // For tree, try 'master' branch
      if (endpoint === "tree") {
        const masterUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
        const masterResp = await fetch(masterUrl, { headers });
        if (masterResp.ok) {
          const data = await masterResp.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (response.status === 403) {
      return new Response(JSON.stringify({ error: "API rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("GitHub API error:", response.status, text);
      return new Response(JSON.stringify({ error: "GitHub API error" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("github-proxy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
