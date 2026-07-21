"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Shared upsell dialog for any Free-plan limit or Pro-only-feature 403 the
 * backend returns (CV limit, cover letter limit, AI daily limit, ATS check
 * limit, Auto Fix, Job Match Score, locked Pro templates, ...). Pass the
 * backend's `detail` message straight through — every one of those already
 * reads as a friendly "Upgrade to Pro" sentence.
 */
export function PlanLimitDialog({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <Dialog open={!!message} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <DialogTitle>You&apos;ve hit a Free plan limit</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => router.push("/pricing")}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-400 hover:opacity-90 transition-opacity"
          >
            Upgrade to Pro
          </button>
          <DialogClose asChild>
            <button className="w-full py-2.5 rounded-md text-sm text-[#8b949e] hover:text-white border border-[#30363d] hover:border-[#8b949e] transition-colors">
              Maybe later
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
