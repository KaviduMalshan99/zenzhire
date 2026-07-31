"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "CV Builder", href: "/features/cv-builder" },
  { label: "ATS Checker", href: "/features/ats-checker" },
  { label: "Pricing", href: "/pricing" },
  { label: "Career Tips", href: "/career-tips" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
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
    <nav
      ref={menuRef}
      className="border-b border-[#30363d] sticky top-0 z-50 bg-[#0d1117]/85 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="ZenzHire" width={165} height={37} className="h-7 w-auto" priority />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#8b949e] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-[#8b949e] hover:text-white transition-colors text-sm">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Get Started
          </Link>
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

      {menuOpen && (
        <div className="md:hidden border-t border-[#30363d] bg-[#0d1117] px-6 py-4">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-[#8b949e] hover:text-white transition-colors text-sm py-2.5"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#30363d]">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-[#8b949e] hover:text-white transition-colors text-sm text-center py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-md text-center transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
