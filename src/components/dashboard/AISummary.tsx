import { useRepo } from "@/context/RepoContext";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AISummary() {
  const { repoData } = useRepo();
  if (!repoData) return null;

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-heading font-semibold">AI Summary</h2>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">Groq AI</span>
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
        <ReactMarkdown>{repoData.aiSummary}</ReactMarkdown>
      </div>
    </div>
  );
}
