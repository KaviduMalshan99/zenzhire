import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Lock } from "lucide-react";

interface Props {
  title: string;
  icon: React.ReactNode;
  score: number;
  maxScore: number;
  percentage: number;
  issues: string[];
  locked?: boolean;
  children?: React.ReactNode;
}

export function LayerCard({ title, icon, score, maxScore, percentage, issues: rawIssues, locked, children }: Props) {
  const issues = rawIssues ?? [];
  const color =
    percentage >= 75 ? "bg-green-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500";
  const textColor =
    percentage >= 75 ? "text-green-400" : percentage >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className={cn("bg-[#161b22] border border-[#30363d] rounded-lg p-5 relative", locked && "overflow-hidden")}>
      {locked && (
        <div className="absolute inset-0 z-10 backdrop-blur-sm bg-[#0d1117]/60 flex flex-col items-center justify-center gap-2 rounded-lg">
          <Lock className="w-6 h-6 text-yellow-400" />
          <p className="text-sm font-medium text-yellow-400">Pro feature</p>
          <p className="text-xs text-[#8b949e] text-center px-4">Upgrade to see full details</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[#8b949e]">{icon}</span>
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        <span className={`text-sm font-bold ${textColor}`}>
          {score}/{maxScore}
        </span>
      </div>

      {/* progress bar */}
      <div className="w-full bg-[#0d1117] rounded-full h-2 mb-3">
        <div
          className={cn("h-2 rounded-full transition-all duration-700", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* issues */}
      {issues.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {issues.slice(0, 3).map((issue, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#8b949e]">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
              {issue}
            </li>
          ))}
        </ul>
      )}

      {issues.length === 0 && (
        <p className="flex items-center gap-1.5 text-xs text-green-400">
          <CheckCircle className="w-3.5 h-3.5" /> All checks passed
        </p>
      )}

      {children}
    </div>
  );
}
