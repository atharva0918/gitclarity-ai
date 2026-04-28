import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---- Provider calls ---------------------------------------------------------

async function callLovableAI(systemPrompt: string, messages: any[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return { ok: false, status: 0, retriable: true, content: "", err: "LOVABLE_API_KEY missing" };

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error("Lovable AI error:", resp.status, txt);
    // 429 (rate limit) and 402 (credits) -> fall back. 5xx -> fall back. 4xx else -> not retriable.
    const retriable = resp.status === 429 || resp.status === 402 || resp.status >= 500;
    return { ok: false, status: resp.status, retriable, content: "", err: txt };
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || "";
  if (!content.trim()) return { ok: false, status: 200, retriable: true, content: "", err: "empty content" };
  return { ok: true, status: 200, retriable: false, content, err: "" };
}

async function callGroq(systemPrompt: string, messages: any[]) {
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) return { ok: false, status: 0, retriable: false, content: "", err: "GROQ_API_KEY missing" };

  // llama-3.3-70b-versatile: 128K context window, handles full repo context with no trimming
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error("Groq error:", resp.status, txt);
    return { ok: false, status: resp.status, retriable: false, content: "", err: txt };
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || "";
  if (!content.trim()) return { ok: false, status: 200, retriable: false, content: "", err: "empty content" };
  return { ok: true, status: 200, retriable: false, content, err: "" };
}

// ---- Main handler -----------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, repoContext, mode } = await req.json();

    let systemPrompt: string;
    if (mode === "contribution-ideas") {
      systemPrompt = `You are GitClarity, an AI that analyzes GitHub repositories to suggest contribution ideas.
You have access to the following repository data:

${repoContext}

RULES:
- Analyze the repository structure, open issues, README, and recent activity.
- Generate 3-5 actionable contribution suggestions.
- Each suggestion must include: title, description, difficulty (beginner/intermediate/advanced), and suggested files or modules.
- If there are labeled issues (good first issue, help wanted), reference them.
- Format as JSON array with fields: title, description, difficulty, files, issueUrl (optional).
- Only use information from the provided data. Never invent issues or files.
- Return ONLY valid JSON, no markdown wrapping.`;
    } else {
      systemPrompt = `You are GitClarity Assistant, an AI that helps people understand a specific GitHub repository.

You have access to the following repository data:

${repoContext}

YOUR JOB:
Answer ANY question — technical or non-technical — as long as it relates to this repository, its purpose, its code, its ecosystem, or how someone might use, learn from, contribute to, or evaluate it.

WHAT COUNTS AS "RELATED" (answer these freely):
- Technical: code structure, architecture, files, languages, frameworks, dependencies, how features work, how to run/build/test, how to contribute, debugging help, explaining commits or contributors.
- Conceptual: what the project does, who it's for, why it exists, comparisons to similar tools, use cases, pros/cons.
- Non-technical: project popularity, activity level, community, license meaning, beginner-friendliness, learning path, whether it suits a given need.
- General knowledge needed to understand the repo: explaining a language, framework, or concept the repo uses (e.g. "what is React?", "what does MIT license mean?", "what is an API?") — answer these because they help the user understand THIS repo.

HOW TO ANSWER:
- For repo-specific facts (stars, files, contributors, commits, README content, languages), ground your answer strictly in the provided data above. Never invent specific facts about this repo.
- If a specific repo fact is genuinely missing from the data, say so briefly (e.g. "The repository data doesn't include that detail") and then offer what you CAN say from what's available.
- For general/conceptual questions that help understand the repo, you may use your general knowledge — but tie the explanation back to this repository when possible.
- Be conversational, clear, and helpful. Match the user's tone (casual or technical).
- Use markdown for readability (lists, code blocks, bold) but keep responses concise.

WHEN TO REFUSE:
Only refuse if the question is clearly unrelated to this repository or to understanding it — e.g. personal advice, unrelated current events, other random topics, or questions about a totally different project. In that case respond briefly:
"That question doesn't seem related to this repository. Feel free to ask me anything about ${repoContext.match(/Repository: (.+)/)?.[1] || "this repo"} — its code, how it works, how to contribute, or anything else about it."

Never refuse a question just because it's basic, broad, or non-technical — if it helps the user understand or engage with this repo, answer it.`;
    }

    // Provider chain: Lovable AI (primary) -> Groq (backup)
    const providers = [
      { name: "lovable-ai", fn: () => callLovableAI(systemPrompt, messages) },
      { name: "groq",       fn: () => callGroq(systemPrompt, messages) },
    ];

    let lastErr = "All providers failed";
    let lastStatus = 500;

    for (const p of providers) {
      const result = await p.fn();
      if (result.ok) {
        console.log(`AI response served by: ${p.name}`);
        return new Response(JSON.stringify({ content: result.content }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      lastErr = result.err;
      lastStatus = result.status || 500;
      // Only continue to next provider if the failure is retriable (rate limit, credits, 5xx, empty)
      // For Lovable AI we always try Groq next; for Groq there's nothing after it.
      if (!result.retriable && p.name !== "lovable-ai") break;
      console.log(`Provider ${p.name} failed (${result.status}), trying next...`);
    }

    // All providers exhausted
    return new Response(
      JSON.stringify({ error: "AI service temporarily unavailable. Please try again in a moment." }),
      { status: lastStatus === 402 ? 402 : 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-chat handler error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
