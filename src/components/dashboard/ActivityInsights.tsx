import { useRepo } from "@/context/RepoContext";
import { Gauge, AlertTriangle, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { useMemo } from "react";

type Tone = "good" | "warn" | "bad" | "neutral";

const toneClasses: Record<Tone, string> = {
  good: "text-emerald-400",
  warn: "text-amber-400",
  bad: "text-red-400",
  neutral: "text-muted-foreground",
};

const dotClasses: Record<Tone, string> = {
  good: "bg-emerald-400",
  warn: "bg-amber-400",
  bad: "bg-red-400",
  neutral: "bg-muted-foreground",
};

export default function ActivityInsights() {
  const { repoData } = useRepo();

  const insights = useMemo(() => {
    if (!repoData) return null;
    const now = Date.now();
    const commits = repoData.commits || [];
    const contributors = repoData.contributors || [];
    const issues = (repoData.issues || []).filter((i: any) => !i.pull_request);

    // Last commit
    const commitDates = commits
      .map((c: any) => new Date(c.commit?.author?.date || c.commit?.committer?.date).getTime())
      .filter((t: number) => !isNaN(t))
      .sort((a: number, b: number) => b - a);
    const lastCommitTs = commitDates[0];
    const daysSince = lastCommitTs ? Math.floor((now - lastCommitTs) / 86400000) : null;

    // Activity status
    let status: { label: string; tone: Tone } = { label: "Unknown", tone: "neutral" };
    if (daysSince !== null) {
      if (daysSince <= 7) status = { label: "Highly Active", tone: "good" };
      else if (daysSince <= 30) status = { label: "Active", tone: "good" };
      else if (daysSince <= 90) status = { label: "Low Activity", tone: "warn" };
      else status = { label: "Inactive", tone: "bad" };
    }

    // Consistency: commits across last 12 weeks
    const weeksHit = new Set<number>();
    commitDates.forEach((t: number) => {
      const weeksAgo = Math.floor((now - t) / (7 * 86400000));
      if (weeksAgo < 12) weeksHit.add(weeksAgo);
    });
    let consistency: { label: string; tone: Tone };
    if (commits.length < 5) consistency = { label: "Sparse", tone: "warn" };
    else if (weeksHit.size >= 8) consistency = { label: "Consistent", tone: "good" };
    else consistency = { label: "Irregular", tone: "warn" };

    // Contribution distribution
    const totalContribs = contributors.reduce((a: number, c: any) => a + (c.contributions || 0), 0);
    const topShare = totalContribs > 0 ? (contributors[0]?.contributions || 0) / totalContribs : 0;
    const contribType =
      topShare > 0.7
        ? { label: "Core-team driven", tone: "warn" as Tone }
        : { label: "Community-driven", tone: "good" as Tone };

    // Issue health
    const openIssues = issues.filter((i: any) => i.state === "open").length;
    const closedIssues = issues.filter((i: any) => i.state === "closed").length;
    let issueHealth: { label: string; tone: Tone };
    if (openIssues + closedIssues === 0) issueHealth = { label: "No data", tone: "neutral" };
    else if (closedIssues > openIssues * 1.5) issueHealth = { label: "Good", tone: "good" };
    else if (openIssues > closedIssues * 2) issueHealth = { label: "Poor", tone: "bad" };
    else issueHealth = { label: "Moderate", tone: "warn" };

    // Risks
    const warnings: string[] = [];
    if (daysSince !== null && daysSince > 60) warnings.push("No commits in last 60+ days");
    if (contributors.length <= 1) warnings.push("Only 1 active contributor");
    if (openIssues > closedIssues * 3 && openIssues > 5) warnings.push("High open issue backlog");

    // Readiness
    let readiness: { label: string; tone: Tone };
    const activeOk = status.tone === "good";
    const hasIssues = openIssues > 0;
    if (activeOk && hasIssues && contributors.length >= 2) readiness = { label: "High", tone: "good" };
    else if (status.tone === "warn" || (activeOk && (!hasIssues || contributors.length < 2)))
      readiness = { label: "Medium", tone: "warn" };
    else readiness = { label: "Low", tone: "bad" };

    // Final decision
    let decision: { headline: string; reason: string; tone: Tone };
    if (readiness.label === "High") {
      decision = {
        headline: "Yes — Good for beginners",
        reason: "Active repo with available issues and stable structure",
        tone: "good",
      };
    } else if (readiness.label === "Medium") {
      decision = {
        headline: "Maybe — Requires some experience",
        reason: "Activity exists but contribution path is less obvious",
        tone: "warn",
      };
    } else {
      decision = {
        headline: "No — Not actively maintained",
        reason: "Repository shows little recent activity",
        tone: "bad",
      };
    }

    return { status, daysSince, consistency, contribType, issueHealth, warnings, readiness, decision };
  }, [repoData]);

  if (!repoData || !insights) return null;

  const Row = ({ label, value, tone }: { label: string; value: string; tone: Tone }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotClasses[tone]}`} />
        <span className={`text-sm font-medium ${toneClasses[tone]}`}>{value}</span>
      </div>
    </div>
  );

  const DecisionIcon =
    insights.decision.tone === "good" ? CheckCircle2 : insights.decision.tone === "warn" ? MinusCircle : XCircle;

  return (
    <div className="rounded-xl bg-card border border-border p-6 fade-in h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-heading font-semibold">Activity Insights</h2>
      </div>

      <div className="flex-1">
        <Row label="Status" value={insights.status.label} tone={insights.status.tone} />
        <Row
          label="Last Commit"
          value={insights.daysSince === null ? "Unknown" : `${insights.daysSince} days ago`}
          tone={insights.daysSince === null ? "neutral" : insights.daysSince <= 30 ? "good" : insights.daysSince <= 90 ? "warn" : "bad"}
        />
        <Row label="Consistency" value={insights.consistency.label} tone={insights.consistency.tone} />
        <Row label="Contribution Type" value={insights.contribType.label} tone={insights.contribType.tone} />
        <Row label="Issue Health" value={insights.issueHealth.label} tone={insights.issueHealth.tone} />
        <Row label="Contribution Readiness" value={insights.readiness.label} tone={insights.readiness.tone} />
      </div>

      {insights.warnings.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-surface border border-amber-400/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Warnings</span>
          </div>
          <ul className="space-y-1">
            {insights.warnings.map((w) => (
              <li key={w} className="text-xs text-muted-foreground">• {w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 p-4 rounded-lg bg-surface">
        <div className="flex items-start gap-3">
          <DecisionIcon className={`h-5 w-5 shrink-0 mt-0.5 ${toneClasses[insights.decision.tone]}`} />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Should You Contribute?</p>
            <p className={`text-sm font-semibold ${toneClasses[insights.decision.tone]}`}>
              {insights.decision.headline}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{insights.decision.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
