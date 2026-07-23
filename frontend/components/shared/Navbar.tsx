"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, FileText, Target, LogOut, Crown, Mail, LayoutTemplate, User as UserIcon, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/cv-builder", label: "CV Builder", icon: FileText },
  { href: "/cover-letter", label: "Cover Letters", icon: Mail },
  { href: "/ats-checker", label: "ATS Checker", icon: Target },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav ref={menuRef} className="border-b border-[#30363d] bg-[#0d1117] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo.png" alt="ZenzHire" width={180} height={60} className="h-10 w-auto" priority />
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
          {user && !user.is_pro && (
            <Link
              href="/pricing"
              className="hidden md:flex items-center gap-1.5 text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full hover:bg-yellow-500/20 transition-colors"
            >
              <Crown className="w-3 h-3" />
              Upgrade to Pro
            </Link>
          )}
          {user?.is_pro && (
            <span className="hidden md:flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          )}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/profile"
              title="Profile"
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {user?.full_name?.[0]?.toUpperCase() ?? "U"}
            </Link>
            <button
              onClick={logout}
              className="text-[#8b949e] hover:text-white transition-colors p-2 rounded-md hover:bg-[#161b22]"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-[#8b949e] hover:text-white hover:bg-[#161b22] transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#30363d] bg-[#0d1117] px-6 py-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors",
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
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#30363d]">
            {user && !user.is_pro && (
              <Link
                href="/pricing"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-2 rounded-full hover:bg-yellow-500/20 transition-colors"
              >
                <Crown className="w-3 h-3" />
                Upgrade to Pro
              </Link>
            )}
            {user?.is_pro && (
              <span className="flex items-center justify-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-2 rounded-full">
                <Crown className="w-3 h-3" />
                Pro
              </span>
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="flex items-center justify-center gap-2 text-[#8b949e] hover:text-white transition-colors text-sm py-2.5 rounded-md hover:bg-[#161b22]"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
