import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRepo } from "@/context/RepoContext";
import { Search, GitBranch, Users, Bot, ArrowRight, Loader2, Github } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

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
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="GitClarity" className="h-7 w-7" />
            <span className="text-lg font-heading font-bold tracking-tight">GitClarity</span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <GitBranch className="absolute top-28 left-[10%] h-6 w-6 text-muted-foreground/20 animate-float" />
          <GitBranch className="absolute top-40 right-[15%] h-5 w-5 text-muted-foreground/15 animate-float-delayed" />
          <GitBranch className="absolute bottom-32 left-[20%] h-4 w-4 text-muted-foreground/10 animate-float" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-muted/5 blur-3xl animate-pulse-slow" />
        </div>

        <div className="container mx-auto max-w-3xl text-center relative z-10 fade-in-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight mb-4">
            GitClarity
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-3">
            Understand any GitHub repository instantly.
          </p>

          <p className="text-sm text-muted-foreground/70 mb-12 max-w-xl mx-auto leading-relaxed">
            Transform any GitHub repository into a structured intelligence dashboard with repository insights, contributor analytics, architecture visualization, and AI-powered explanations.
          </p>

          {/* URL Input */}
          <div className="max-w-2xl mx-auto mb-4">
            <label className="block text-xs text-muted-foreground mb-2 text-left">
              Enter GitHub repository link
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoading && handleAnalyze()}
                  placeholder="Paste repository URL here"
                  className="w-full h-12 pl-11 pr-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/20 transition-all text-sm"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !url.trim()}
                className="h-12 px-6 rounded-lg bg-foreground text-background font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
            <p className="text-xs text-muted-foreground/50 mt-2 text-left">
              Example: https://github.com/facebook/react
            </p>
          </div>

          {isLoading && loadingStatus && (
            <p className="text-sm text-muted-foreground animate-pulse mt-4">{loadingStatus}</p>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-heading font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: GitBranch, title: "Repository Intelligence", desc: "Get structured insights into code architecture, file structure, and project entry points." },
              { icon: Users, title: "Contribution Insights", desc: "Visualize contributor activity, commit patterns, and discover ways to contribute." },
              { icon: Bot, title: "AI Repository Assistant", desc: "Ask questions about any repository and get answers grounded in real data." },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-card border border-border card-hover opacity-0 fade-in-up"
                style={{ animationDelay: `${i * 0.15}s`, animationFillMode: "forwards" }}
              >
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 border-t border-border">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-heading font-bold text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Paste URL", desc: "Enter any GitHub repository URL into the search field." },
              { step: "02", title: "Analyze", desc: "GitClarity fetches and processes repository data in real-time." },
              { step: "03", title: "Explore", desc: "Navigate the structured dashboard with insights, charts, and AI assistant." },
            ].map((s, i) => (
              <div key={i} className="text-center opacity-0 fade-in-up" style={{ animationDelay: `${i * 0.15}s`, animationFillMode: "forwards" }}>
                <div className="text-3xl font-heading font-bold text-muted-foreground/30 mb-3">{s.step}</div>
                <h3 className="font-heading font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-4 border-t border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">About GitClarity</h2>
          <p className="text-muted-foreground leading-relaxed">
            Developers spend hours understanding unfamiliar repositories. GitClarity reduces that to minutes by transforming raw repository data into clear, structured dashboards with AI-powered insights — all grounded in real data, never hallucinated. Our mission is to make open source more accessible and help developers find meaningful ways to contribute.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Built with GitClarity</p>
        </div>
      </footer>
    </div>
  );
}
