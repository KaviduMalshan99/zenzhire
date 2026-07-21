"use client";

import { cn } from "@/lib/utils";
import { getPasswordStrength, getPasswordHints } from "@/lib/password";

const STRENGTH_CONFIG = {
  weak: { label: "Weak", bar: "bg-red-500", text: "text-red-400", width: "33%" },
  medium: { label: "Medium", bar: "bg-yellow-500", text: "text-yellow-400", width: "66%" },
  strong: { label: "Strong", bar: "bg-green-500", text: "text-green-400", width: "100%" },
} as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const config = STRENGTH_CONFIG[strength];
  const hints = getPasswordHints(password);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-[#0d1117] rounded-full h-1.5">
          <div
            className={cn("h-1.5 rounded-full transition-all duration-300", config.bar)}
            style={{ width: config.width }}
          />
        </div>
        <span className={cn("text-xs font-medium flex-shrink-0", config.text)}>{config.label}</span>
      </div>
      {hints.length > 0 && (
        <p className="text-[11px] text-[#8b949e] mt-1.5">{hints.join(" · ")}</p>
      )}
    </div>
  );
}
