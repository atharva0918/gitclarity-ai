import { useRepo } from "@/context/RepoContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
import Navbar from "@/components/Navbar";
import SaveRepoModal from "@/components/SaveRepoModal";
import { Bookmark } from "lucide-react";

export default function Dashboard() {
  const { repoData } = useRepo();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/");
    else if (!repoData) navigate("/");
  }, [repoData, user, loading, navigate]);

  if (!repoData) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12 space-y-8 max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-mono text-muted-foreground truncate">{repoData.owner}/{repoData.repo}</p>
          <button
            onClick={() => setSaveOpen(true)}
            className="h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Bookmark className="h-4 w-4" /> Save Repository
          </button>
        </div>

        <RepoOverview />
        <AISummary />
        <FileTree />
        <EntryPoints />
        <LanguageChart />
        <div className="grid lg:grid-cols-2 gap-8">
          <ActivityCharts />
          <ActivityInsights />
        </div>
        <TopContributors />
        <BestFirstSteps />
        <ContributionInsights />
        <HowToContribute />
        <ContributionIdeas />
      </main>

      <AIChatbot />
      <SaveRepoModal open={saveOpen} onOpenChange={setSaveOpen} />
    </div>
  );
}
