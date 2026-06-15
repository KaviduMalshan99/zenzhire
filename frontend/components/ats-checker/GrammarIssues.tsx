import { Lock, CheckCircle } from "lucide-react";

interface GrammarError {
  message: string;
  context: string;
  suggestion: string;
  offset: number | null;
}

interface Props {
  errors: GrammarError[];
  fillerWords: string[];
  tenseIssues: string[];
  isPro: boolean;
}

export function GrammarIssues({ errors: rawErrors, fillerWords: rawFillerWords, tenseIssues: rawTenseIssues, isPro }: Props) {
  const errors = rawErrors ?? [];
  const fillerWords = rawFillerWords ?? [];
  const tenseIssues = rawTenseIssues ?? [];
  const visible = isPro ? errors : errors.slice(0, 2);
  const total = errors.length;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Language & Grammar</h3>
        <span className={`text-sm font-medium ${total === 0 ? "text-green-400" : "text-yellow-400"}`}>
          {total} issue{total !== 1 ? "s" : ""} found
        </span>
      </div>

      {total === 0 && fillerWords.length === 0 && tenseIssues.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle className="w-4 h-4" /> No grammar or spelling issues detected.
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((err, i) => (
            <div key={i} className="bg-[#0d1117] rounded-md p-3 border border-[#30363d]">
              <p className="text-xs text-yellow-400 mb-1">{err.message}</p>
              <p className="text-xs text-[#8b949e] font-mono">
                &hellip;{err.context}&hellip;
              </p>
              {err.suggestion && (
                <p className="text-xs text-green-400 mt-1">
                  → Suggestion: <span className="font-medium">{err.suggestion}</span>
                </p>
              )}
            </div>
          ))}

          {!isPro && total > 2 && (
            <div className="flex items-center gap-2 bg-[#0d1117] rounded-md p-3 border border-[#30363d]">
              <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <p className="text-xs text-[#8b949e]">
                {total - 2} more issue{total - 2 !== 1 ? "s" : ""} hidden — upgrade to Pro to see all.
              </p>
            </div>
          )}

          {tenseIssues.length > 0 && (
            <div className="bg-[#0d1117] rounded-md p-3 border border-[#30363d]">
              <p className="text-xs text-orange-400 font-medium mb-1">Tense consistency</p>
              {tenseIssues.map((t, i) => (
                <p key={i} className="text-xs text-[#8b949e]">{t}</p>
              ))}
            </div>
          )}

          {fillerWords.length > 0 && (
            <div className="bg-[#0d1117] rounded-md p-3 border border-[#30363d]">
              <p className="text-xs text-orange-400 font-medium mb-1">Filler words</p>
              <p className="text-xs text-[#8b949e]">{fillerWords.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
