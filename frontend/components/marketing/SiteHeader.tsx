import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <nav className="border-b border-[#30363d] sticky top-0 z-50 bg-[#0d1117]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="ZenzHire" width={165} height={37} className="h-7 w-auto" priority />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/templates" className="text-[#8b949e] hover:text-white transition-colors">
            Templates
          </Link>
          <Link href="/pricing" className="text-[#8b949e] hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/career-tips" className="text-[#8b949e] hover:text-white transition-colors">
            Career Tips
          </Link>
          <Link href="/about" className="text-[#8b949e] hover:text-white transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-[#8b949e] hover:text-white transition-colors">
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-[#8b949e] hover:text-white transition-colors text-sm">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
