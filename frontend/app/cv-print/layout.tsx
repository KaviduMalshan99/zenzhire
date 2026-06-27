"use client";

export default function CVPrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Force white background from the very first server-rendered byte.
          globals.css sets html,body to dark (#0d1117) — this overrides it for
          the print route without relying on useEffect timing. */}
      <style>{`
        html, body {
          background-color: #ffffff !important;
          color: #111827 !important;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}</style>
      {children}
    </>
  );
}
