"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Star,
  Mail,
  Newspaper,
  ShieldAlert,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { adminApi, type AdminNotifications } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, dot: "none" as const },
  { href: "/admin/users", label: "Users", icon: Users, dot: "none" as const },
  { href: "/admin/reviews", label: "Reviews", icon: Star, dot: "reviews" as const },
  { href: "/admin/contact", label: "Contact Submissions", icon: Mail, dot: "contact" as const },
  { href: "/admin/career-tips", label: "Career Tips", icon: Newspaper, dot: "none" as const },
  { href: "/admin/admins", label: "Admins", icon: ShieldAlert, dot: "none" as const },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotifications | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.is_admin) {
      router.replace("/dashboard");
      return;
    }
    setAuthorized(true);
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authorized) return;

    let cancelled = false;
    async function run() {
      try {
        if (pathname === "/admin/contact") {
          await adminApi.markContactViewed();
        }
        const res = await adminApi.notifications();
        if (!cancelled) setNotifications(res.data);
      } catch {
        // notifications are non-critical; fail silently
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [authorized, pathname]);

  if (authLoading || !authorized) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#8b949e] animate-spin" />
      </div>
    );
  }

  function showDot(kind: "reviews" | "contact" | "none") {
    if (!notifications) return false;
    if (kind === "reviews") return notifications.pending_reviews_count > 0;
    if (kind === "contact") return notifications.new_contact_submissions;
    return false;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-[#30363d] bg-[#0d1117] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#30363d]">
          <Link href="/admin/dashboard" className="flex items-center">
            <Image src="/logo.png" alt="ZenzHire" width={150} height={34} className="h-8 w-auto" priority />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-blue-600/10 text-blue-400"
                    : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {showDot(item.dot) && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#30363d]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
              {user?.full_name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm truncate">{user?.full_name}</p>
              <p className="text-[#8b949e] text-xs truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-[#8b949e] hover:text-white transition-colors p-1.5 rounded-md hover:bg-[#161b22] shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <Link
            href="/dashboard"
            className="block mt-1 px-3 py-1.5 text-xs text-[#8b949e] hover:text-white transition-colors"
          >
            ← Back to app
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
