import { Lock } from "lucide-react";

interface Props {
  matched: string[];
  missing: string[];
  semantic: string[];
  matchPct: number;
  mode: "jd_match" | "industry_coverage";
  isPro: boolean;
}

export function KeywordHeatmap({ matched: rawMatched, missing: rawMissing, semantic: rawSemantic, matchPct, mode, isPro }: Props) {
  const matched = rawMatched ?? [];
  const missing = rawMissing ?? [];
  const semantic = rawSemantic ?? [];
  const showMissing = isPro ? missing : missing.slice(0, 3);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">
          {mode === "jd_match" ? "Keyword Match Analysis" : "Industry Skill Coverage"}
        </h3>
        <span className="text-sm font-semibold text-blue-400">{matchPct.toFixed(0)}% match</span>
      </div>

      {matched.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">
            ✓ Found in your CV ({matched.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((kw) => {
              const isSemantic = semantic.some((s) => s.startsWith(kw));
              return (
                <span
                  key={kw}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    isSemantic
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : "bg-green-500/10 border-green-500/20 text-green-400"
                  }`}
                  title={isSemantic ? "Semantic match" : "Exact match"}
                >
                  {kw}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {(missing.length > 0 || !isPro) && (
        <div className="relative">
          <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-2">
            ✗ Missing from CV ({missing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {showMissing.map((kw) => (
              <span
                key={kw}
                className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400"
              >
                {kw}
              </span>
            ))}
            {!isPro && missing.length > 3 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#30363d] border border-[#30363d] text-[#8b949e] flex items-center gap-1">
                <Lock className="w-3 h-3" /> +{missing.length - 3} more (Pro)
              </span>
            )}
          </div>
        </div>
      )}

      {semantic.length > 0 && (
        <p className="mt-3 text-xs text-[#8b949e]">
          <span className="text-blue-400">●</span> Blue = semantic match (similar meaning found)
        </p>
      )}
    </div>
  );
}
