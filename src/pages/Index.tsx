import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRepo } from "@/context/RepoContext";
import { Search, GitBranch, Users, Bot, Zap, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export default function Index() {
  const [url, setUrl] = useState("");
  const { analyzeRepo, isLoading, loadingStatus } = useRepo();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    const parsed = parseGitHubUrl(url.trim());
    if (!parsed) {
      toast.error("Invalid GitHub URL. Example: https://github.com/facebook/react");
      return;
    }
    const success = await analyzeRepo(parsed.owner, parsed.repo);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            <span className="text-xl font-heading font-bold">GitClarity</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl text-center fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-xs text-muted-foreground mb-6">
            <Zap className="h-3 w-3 text-primary" />
            Powered by AI & GitHub API
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight mb-4">
            <span className="gradient-text">GitClarity</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Understand any GitHub repository instantly. Get structured insights, visual analytics, and AI-powered answers.
          </p>

          {/* URL Input */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleAnalyze()}
                placeholder="https://github.com/facebook/react"
                className="w-full h-12 pl-11 pr-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !url.trim()}
              className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-accent-hover"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {isLoading && loadingStatus && (
            <p className="text-sm text-muted-foreground animate-pulse">{loadingStatus}</p>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: GitBranch, title: "Repository Intelligence", desc: "Get structured insights into code architecture, dependencies, and project health." },
              { icon: Users, title: "Contribution Insights", desc: "Visualize contributor activity, commit patterns, and collaboration dynamics." },
              { icon: Bot, title: "AI Repository Assistant", desc: "Ask questions about any repository and get answers grounded in real data." },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-card border border-border card-hover"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4 border-t border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">Why GitClarity?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Developers spend hours understanding unfamiliar repositories. GitClarity reduces that to minutes by transforming raw repository data into clear, structured dashboards with AI-powered insights — all grounded in real data, never hallucinated.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Built with GitClarity · Powered by GitHub API & Groq AI</p>
        </div>
      </footer>
    </div>
  );
}
