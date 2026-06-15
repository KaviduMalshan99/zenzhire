"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, FileText, Target, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cv-builder", label: "CV Builder", icon: FileText },
  { href: "/ats-checker", label: "ATS Checker", icon: Target },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#30363d] bg-[#0d1117] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Zap className="text-blue-500 w-6 h-6" />
            <span className="text-lg font-bold text-white">ZenzHire</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  pathname === link.href
                    ? "bg-blue-600/10 text-blue-400"
                    : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.plan === "free" && (
            <Link
              href="/pricing"
              className="hidden md:flex items-center gap-1.5 text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full hover:bg-yellow-500/20 transition-colors"
            >
              <Crown className="w-3 h-3" />
              Upgrade to Pro
            </Link>
          )}
          {user?.plan === "pro" && (
            <span className="hidden md:flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.full_name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <button
              onClick={logout}
              className="text-[#8b949e] hover:text-white transition-colors p-2 rounded-md hover:bg-[#161b22]"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
