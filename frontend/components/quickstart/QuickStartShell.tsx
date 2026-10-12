"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Below md the quick-start is a full-screen layer sized to the *visual* viewport,
// so the pinned footer (Continue) always sits just above the on-screen keyboard:
// on Android/iOS the keyboard shrinks visualViewport but not the layout viewport,
// so 100dvh / bottom:0 alone would end up behind it. iOS also scrolls the page
// when an input is focused, which offsetTop compensates for.
function useMobileVisualViewport() {
  const [box, setBox] = useState<{ height: number; offsetTop: number } | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setBox(mq.matches && vv ? { height: vv.height, offsetTop: vv.offsetTop } : null);
    };
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    mq.addEventListener("change", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  return box;
}

export function QuickStartShell({
  header,
  footer,
  children,
  mainClassName,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  mainClassName?: string;
}) {
  const box = useMobileVisualViewport();

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 h-[100dvh] bg-[#0d1117] flex md:static md:z-auto md:h-[calc(100dvh-64px)] md:items-center md:justify-center md:px-6 md:py-8"
      style={box ? { height: box.height, transform: `translateY(${box.offsetTop}px)` } : undefined}
    >
      <div
        data-qs-card
        className="flex flex-col w-full h-full md:max-w-[480px] md:max-h-[860px] md:border md:border-[#30363d] md:rounded-2xl md:bg-[#161b22] md:shadow-xl md:shadow-black/30 overflow-hidden"
      >
        {header && <div className="flex-shrink-0">{header}</div>}
        <main className={cn("flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6", mainClassName)}>
          {children}
        </main>
        {footer && (
          <div data-qs-footer className="flex-shrink-0 border-t border-[#30363d] bg-[#0d1117] md:bg-[#161b22] px-5 sm:px-6 pt-3 pb-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ZeniAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 text-white bg-[#2563eb]",
        size === "lg" ? "w-20 h-20" : "w-9 h-9",
      )}
    >
      <Sparkles className={size === "lg" ? "w-9 h-9" : "w-4 h-4"} />
    </div>
  );
}

// Shared button styles: 48px tall (>= 44px tap target) with a visible focus ring.
export const primaryButton =
  "w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-[15px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]";

export const secondaryButton =
  "w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#30363d] bg-[#0d1117] hover:border-[#8b949e] text-[#e6edf3] text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]";
