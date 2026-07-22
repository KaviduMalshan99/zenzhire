"use client";

import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { SHARE_LINKS } from "@/lib/share-links";

export function DownloadSuccessDialog({
  open,
  onClose,
  documentLabel = "CV",
}: {
  open: boolean;
  onClose: () => void;
  documentLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <DialogTitle>Your {documentLabel} is downloaded! ✅</DialogTitle>
        </DialogHeader>

        <div className="mt-5 flex flex-col gap-5">
          {SOCIAL_LINKS.length > 0 && (
            <div>
              <p className="text-sm text-[#c9d1d9] mb-3">Want more resume tips? Follow us</p>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="group w-9 h-9 rounded-full bg-[#0d1117] border border-[#30363d] hover:border-emerald-400/60 flex items-center justify-center transition-colors"
                  >
                    <s.icon className="w-4 h-4 text-[#8b949e] group-hover:text-emerald-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-[#c9d1d9] mb-3">Share ZenzHire with a friend</p>
            <div className="flex items-center gap-3">
              {SHARE_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group w-9 h-9 rounded-full bg-[#0d1117] border border-[#30363d] hover:border-blue-500/60 flex items-center justify-center transition-colors"
                >
                  <s.icon className="w-4 h-4 text-[#8b949e] group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <Link
            href="/reviews"
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-[#c9d1d9] hover:text-white transition-colors pt-4 border-t border-[#30363d]"
          >
            <Star className="w-4 h-4 text-amber-400" />
            How&apos;s your experience been? <span className="text-emerald-400 font-medium">Leave a review</span>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
