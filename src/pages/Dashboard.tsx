import { useRepo } from "@/context/RepoContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import RepoOverview from "@/components/dashboard/RepoOverview";
import AISummary from "@/components/dashboard/AISummary";
import LanguageChart from "@/components/dashboard/LanguageChart";
import ActivityCharts from "@/components/dashboard/ActivityCharts";
import ActivityInsights from "@/components/dashboard/ActivityInsights";
import FileTree from "@/components/dashboard/FileTree";
import EntryPoints from "@/components/dashboard/EntryPoints";
import TopContributors from "@/components/dashboard/TopContributors";
import BestFirstSteps from "@/components/dashboard/BestFirstSteps";
import ContributionInsights from "@/components/dashboard/ContributionInsights";
import HowToContribute from "@/components/dashboard/HowToContribute";
import ContributionIdeas from "@/components/dashboard/ContributionIdeas";
import AIChatbot from "@/components/dashboard/AIChatbot";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Dashboard() {
  const { repoData } = useRepo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!repoData) navigate("/");
  }, [repoData, navigate]);

  if (!repoData) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <img src={logo} alt="GitClarity" className="h-5 w-5" />
              <span className="font-heading font-bold">GitClarity</span>
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-mono text-muted-foreground">{repoData.owner}/{repoData.repo}</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
        <RepoOverview />
        <AISummary />
        <div className="grid lg:grid-cols-2 gap-8">
          <LanguageChart />
          <ActivityCharts />
        </div>
        <ContributionHeatmap />
        <FileTree />
        <EntryPoints />
        <TopContributors />
        <ContributionInsights />
        <HowToContribute />
        <ContributionIdeas />
      </main>

      <AIChatbot />
    </div>
  );
}
