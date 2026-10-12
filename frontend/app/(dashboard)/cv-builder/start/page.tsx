"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, PencilLine, Upload, ShieldCheck, ChevronRight, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { QuickStartShell, focusRing } from "@/components/quickstart/QuickStartShell";
import { apiErrorMessage, clearQuickStart, createBuilderCv, firstName } from "@/lib/quickstart";
import { PlanLimitDialog } from "@/components/shared/PlanLimitDialog";
import { cn } from "@/lib/utils";

// Welcome screen for users with no CV yet (after signup, or "Create New CV" on
// an empty dashboard). Users who already have CVs keep the template picker.
export default function QuickStartWelcomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [creating, setCreating] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  const name = firstName(user?.full_name);

  const startWithZeni = () => {
    clearQuickStart();
    router.push("/cv-builder/onboarding");
  };

  const fillItInMyself = async () => {
    setCreating(true);
    try {
      const id = await createBuilderCv();
      router.push(`/cv-builder/${id}`);
    } catch (err) {
      setLimitMessage(apiErrorMessage(err, "Couldn't create your CV. Please try again."));
      setCreating(false);
    }
  };

  return (
    <QuickStartShell
      header={
        <div className="flex items-center justify-end px-2 pt-2">
          <Link
            href="/dashboard"
            aria-label="Close"
            className={cn("w-11 h-11 rounded-lg flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors", focusRing)}
          >
            <X className="w-5 h-5" />
          </Link>
        </div>
      }
      mainClassName="pb-6"
    >
      <p className="text-[#8b949e] text-[15px]">{loading ? " " : `${name ? `Hi ${name}` : "Hi there"} 👋`}</p>
      <h1 className="text-white text-[28px] leading-tight font-bold mt-1">Let&apos;s build your CV</h1>
      <p className="text-[#8b949e] text-[15px] mt-2">Choose how you want to start. You can change anything later.</p>

      <div className="flex flex-col gap-3 mt-6">
        <button
          type="button"
          onClick={startWithZeni}
          className={cn(
            "relative text-left rounded-2xl border-2 border-[#2563eb] bg-[#2563eb]/10 hover:bg-[#2563eb]/15 p-4 pr-10 transition-colors",
            focusRing,
          )}
        >
          <span className="flex items-center gap-2 flex-wrap">
            <span className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="text-white font-semibold text-base">Build it with Zeni</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white bg-[#2563eb] rounded-full px-2 py-0.5">
              Recommended
            </span>
          </span>
          <span className="block text-[#c9d1d9] text-sm mt-2.5">
            Answer about 10 short questions. Zeni turns your answers into a finished CV.
          </span>
          <span className="block text-blue-300 text-xs font-medium mt-2">About 5 minutes · Free</span>
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={fillItInMyself}
          disabled={creating}
          className={cn(
            "relative text-left rounded-2xl border border-[#30363d] bg-[#161b22] md:bg-[#0d1117] hover:border-[#8b949e] p-4 pr-10 transition-colors disabled:opacity-60",
            focusRing,
          )}
        >
          <span className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-[#21262d] text-[#e6edf3] flex items-center justify-center flex-shrink-0">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <PencilLine className="w-4 h-4" aria-hidden="true" />}
            </span>
            <span className="text-white font-semibold text-base">Fill it in myself</span>
          </span>
          <span className="block text-[#8b949e] text-sm mt-2.5">Open the editor and type each section yourself.</span>
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b949e]" aria-hidden="true" />
        </button>

        <div
          aria-disabled="true"
          className="rounded-2xl border border-dashed border-[#30363d] p-4 opacity-70 cursor-not-allowed"
        >
          <span className="flex items-center gap-2 flex-wrap">
            <span className="w-9 h-9 rounded-full bg-[#21262d] text-[#8b949e] flex items-center justify-center flex-shrink-0">
              <Upload className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="text-[#c9d1d9] font-semibold text-base">Upload my old CV</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b949e] border border-[#30363d] rounded-full px-2 py-0.5">
              Coming soon
            </span>
          </span>
        </div>
      </div>

      <p className="flex items-start gap-2 text-[#8b949e] text-[13px] mt-6">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        Zeni only uses what you tell it. It never makes up jobs, results or numbers.
      </p>

      <PlanLimitDialog message={limitMessage} onClose={() => setLimitMessage(null)} />
    </QuickStartShell>
  );
}
