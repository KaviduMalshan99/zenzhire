"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function BillingReturnPage() {
  const router = useRouter();
  const { user, refetch } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // The webhook (server-to-server) is what actually grants Pro access, and it
    // can land a moment after this page does. One refetch now, then hand off to
    // the dashboard either way -- we don't block the user waiting on it.
    refetch().finally(() => setChecked(true));
    const t = setTimeout(() => router.replace("/dashboard"), 4000);
    return () => clearTimeout(t);
  }, [refetch, router]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {checked && user?.is_pro ? (
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-4" />
        ) : (
          <Loader2 className="w-10 h-10 text-blue-400 mx-auto mb-4 animate-spin" />
        )}
        <h1 className="text-white text-lg font-semibold mb-2">
          {checked && user?.is_pro ? "You're on Pro!" : "Finishing up your payment..."}
        </h1>
        <p className="text-[#8b949e] text-sm mb-6">
          {checked && user?.is_pro
            ? "Your Pro access is active. Taking you to your dashboard."
            : "This usually takes just a few seconds. If your payment succeeded, your account will update automatically — you don't need to wait here."}
        </p>
        <button
          onClick={() => router.replace("/dashboard")}
          className="text-sm text-blue-400 hover:underline"
        >
          Go to Dashboard now →
        </button>
      </div>
    </div>
  );
}
