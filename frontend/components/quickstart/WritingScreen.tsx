"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickStartShell, ZeniAvatar, primaryButton, secondaryButton } from "./QuickStartShell";

// /finish is one request, so the checklist just advances on a timer while it
// runs — the last item stays "in progress" until the response comes back. No
// percentage on purpose: we don't actually know one.
const STEP_MS = 2500;

export function WritingScreen({
  hasExperience,
  done,
  error,
  retrying,
  onRetry,
  onContinueWithout,
}: {
  hasExperience: boolean;
  done: boolean;
  error: string | null;
  retrying: boolean;
  onRetry: () => void;
  onContinueWithout: () => void;
}) {
  const items = ["Your details", hasExperience ? "Work experience" : "Project", "Education", "Skills", "Summary"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (error) return;
    setActive(0);
    const timer = window.setInterval(() => setActive((i) => Math.min(i + 1, items.length - 1)), STEP_MS);
    return () => window.clearInterval(timer);
    // Restart only when a new attempt begins (error cleared).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  if (error) {
    return (
      <QuickStartShell
        footer={
          <div className="flex flex-col gap-2.5">
            <button type="button" onClick={onRetry} disabled={retrying} className={primaryButton}>
              {retrying && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              Try again
            </button>
            <button type="button" onClick={onContinueWithout} className={secondaryButton}>
              Continue without Zeni
            </button>
          </div>
        }
        mainClassName="flex flex-col justify-center py-8"
      >
        <div role="alert" className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-400" aria-hidden="true" />
          </div>
          <h1 className="text-white text-2xl font-bold mt-5">Zeni couldn&apos;t finish writing right now.</h1>
          <p className="text-[#8b949e] text-[15px] mt-3 max-w-sm">
            Your answers are saved. You can try again, or open your CV with your own words and edit it yourself.
          </p>
        </div>
      </QuickStartShell>
    );
  }

  return (
    <QuickStartShell mainClassName="flex flex-col justify-center py-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-[#2563eb]/30 motion-safe:animate-ping" aria-hidden="true" />
          <div className="relative">
            <ZeniAvatar size="lg" />
          </div>
        </div>
        <h1 className="text-white text-2xl font-bold mt-6">Writing your CV…</h1>
        <p className="text-[#8b949e] text-[15px] mt-2">This takes about 15 seconds.</p>
      </div>

      <ul aria-label="Sections" className="mt-8 flex flex-col gap-2.5 w-full max-w-xs mx-auto">
        {items.map((label, i) => {
          const state = done || i < active ? "done" : i === active ? "active" : "waiting";
          return (
            <li key={label} className="flex items-center gap-3 min-h-[40px]">
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2",
                  state === "done" && "bg-[#2563eb] border-[#2563eb]",
                  state === "active" && "border-[#2563eb]",
                  state === "waiting" && "border-[#30363d]",
                )}
              >
                {state === "done" && <Check className="w-4 h-4 text-white" strokeWidth={3} aria-hidden="true" />}
                {state === "active" && <Loader2 className="w-4 h-4 text-blue-300 animate-spin" aria-hidden="true" />}
              </span>
              <span className={cn("text-[15px]", state === "waiting" ? "text-[#6e7681]" : "text-[#e6edf3]")}>{label}</span>
              <span className="sr-only">
                {state === "done" ? "done" : state === "active" ? "in progress" : "waiting"}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="flex items-start justify-center gap-2 text-[#8b949e] text-[13px] mt-8 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        Using only your answers. No made-up numbers or results.
      </p>
    </QuickStartShell>
  );
}
