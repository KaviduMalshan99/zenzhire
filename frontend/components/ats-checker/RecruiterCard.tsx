import { Lock, Star, AlertTriangle, TrendingUp } from "lucide-react";

interface Props {
  layer: {
    first_impression: string;
    strengths: string[];
    red_flags: string[];
    seniority_assessment: string;
    hire_likelihood: number;
    most_important_improvement: string;
    score: number;
    max_score: number;
  };
  isPro: boolean;
}

export function RecruiterCard({ layer, isPro }: Props) {
  const likelihood = layer.hire_likelihood;
  const likeColor =
    likelihood >= 70 ? "text-green-400" : likelihood >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="relative rounded-lg overflow-hidden border border-blue-600/30 bg-gradient-to-br from-blue-600/5 to-[#161b22]">
      {!isPro && (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-[#0d1117]/70 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-white font-semibold">AI Recruiter Feedback</p>
          <p className="text-[#8b949e] text-sm text-center max-w-xs">
            Get a senior recruiter&apos;s perspective on your CV — upgrade to Pro.
          </p>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
              <span className="text-white font-semibold">Senior Recruiter Simulation</span>
            </div>
            <p className="text-xs text-[#8b949e]">claude-sonnet-4-6 · 10+ yrs experience perspective</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${likeColor}`}>{Math.round(likelihood)}%</p>
            <p className="text-xs text-[#8b949e]">hire likelihood</p>
          </div>
        </div>

        {/* First impression */}
        <div className="bg-[#0d1117] rounded-lg p-4 mb-4 border border-[#30363d]">
          <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-1">First impression</p>
          <p className="text-[#e6edf3] text-sm leading-relaxed italic">&ldquo;{layer.first_impression}&rdquo;</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Strengths</span>
            </div>
            <ul className="space-y-1.5">
              {layer.strengths.map((s, i) => (
                <li key={i} className="text-xs text-[#e6edf3] flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Red flags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Red Flags</span>
            </div>
            <ul className="space-y-1.5">
              {layer.red_flags.map((f, i) => (
                <li key={i} className="text-xs text-[#e6edf3] flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">⚑</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Seniority + improvement */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-[#0d1117] rounded-md px-4 py-3 border border-[#30363d] flex-1">
            <p className="text-xs text-[#8b949e] mb-1">Seniority</p>
            <p className="text-white text-sm font-medium">{layer.seniority_assessment}</p>
          </div>
          <div className="bg-[#0d1117] rounded-md px-4 py-3 border border-blue-600/20 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-xs text-blue-400">Top improvement</p>
            </div>
            <p className="text-[#e6edf3] text-xs leading-relaxed">{layer.most_important_improvement}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
