"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const token = new URLSearchParams(hash).get("token");

    if (!token) {
      toast.error("Google sign-in failed. Please try again.");
      router.replace("/login?error=google_auth_failed");
      return;
    }

    Cookies.set("token", token, { expires: 7, sameSite: "lax" });
    toast.success("Welcome!");
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="flex items-center gap-2 text-[#8b949e] text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Signing you in…
      </div>
    </div>
  );
}
