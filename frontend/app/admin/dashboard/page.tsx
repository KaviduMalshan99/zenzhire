"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Mail, LayoutTemplate, ShieldAlert } from "lucide-react";
import { adminApi, type AdminStats } from "@/lib/api";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">Internal tools — visible only to admin accounts.</p>
        </div>
      </div>

      {/* Overview stats */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {loading ? "—" : stats?.total_users ?? 0}
            </p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Total CVs Created</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {loading ? "—" : stats?.total_cvs ?? 0}
            </p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Total Cover Letters</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {loading ? "—" : stats?.total_cover_letters ?? 0}
            </p>
          </div>
        </div>

        {/* CVs per template */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <LayoutTemplate className="text-blue-400 w-5 h-5" />
            <span className="text-[#8b949e] text-sm">CVs per Template</span>
          </div>
          {loading ? (
            <p className="text-[#484f58] text-sm">Loading…</p>
          ) : !stats || Object.keys(stats.cvs_per_template).length === 0 ? (
            <p className="text-[#484f58] text-sm">No CVs created yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(stats.cvs_per_template)
                .sort((a, b) => b[1] - a[1])
                .map(([templateId, count]) => (
                  <div
                    key={templateId}
                    className="flex items-center justify-between bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2"
                  >
                    <span className="text-[#c9d1d9] text-sm capitalize">{templateId}</span>
                    <span className="text-white text-sm font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
