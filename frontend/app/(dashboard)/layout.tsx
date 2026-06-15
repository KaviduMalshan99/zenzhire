import { Navbar } from "@/components/shared/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
