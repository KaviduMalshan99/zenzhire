"use client";

import { useEffect, useState } from "react";
import { Users as UsersIcon } from "lucide-react";
import { adminApi, type AdminUser } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";

type Tab = "free" | "pro";

export default function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>("free");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .users(tab)
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
          <UsersIcon className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">Read-only view of registered accounts.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#30363d]">
        {(["free", "pro"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-blue-500 text-white"
                : "border-transparent text-[#8b949e] hover:text-white"
            )}
          >
            {t === "free" ? "Free" : "Paid"}
          </button>
        ))}
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-[#484f58] text-sm p-5">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-[#484f58] text-sm p-5">No {tab === "free" ? "free" : "paid"} users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-left text-[#8b949e]">
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Signup Date</th>
                  <th className="px-5 py-3 font-medium text-right whitespace-nowrap">CVs Created</th>
                  <th className="px-5 py-3 font-medium text-right whitespace-nowrap">ATS Analyses</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#30363d] last:border-0">
                    <td className="px-5 py-3 text-white whitespace-nowrap">{u.email}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={
                          u.plan === "pro"
                            ? "inline-flex items-center text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full"
                            : "inline-flex items-center text-xs bg-[#0d1117] border border-[#30363d] text-[#8b949e] px-2 py-0.5 rounded-full"
                        }
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#8b949e] whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3 text-white text-right whitespace-nowrap">{u.cv_count}</td>
                    <td className="px-5 py-3 text-white text-right whitespace-nowrap">{u.ats_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
