"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Calendar,
  Wallet,
  TrendingUp,
  Users as UsersIcon,
  UserCheck,
  UserPlus,
  Search,
} from "lucide-react";
import { adminApi, type AdminEarningsStats, type AdminTransaction, type AdminProMember } from "@/lib/api";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

const PLAN_LABELS: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  pass7: "7-Day Pass",
};

type StatusFilter = "all" | "success" | "pending" | "failed";

const STATUS_TABS: StatusFilter[] = ["all", "success", "pending", "failed"];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function statusBadgeClass(status: string) {
  if (status === "success") return "bg-green-500/10 border-green-500/20 text-green-400";
  if (status === "pending") return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
  return "bg-red-500/10 border-red-500/20 text-red-400";
}

export default function AdminEarningsPage() {
  const [stats, setStats] = useState<AdminEarningsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  const [proMembers, setProMembers] = useState<AdminProMember[]>([]);
  const [proLoading, setProLoading] = useState(true);

  useEffect(() => {
    adminApi
      .earningsStats()
      .then((res) => setStats(res.data))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    adminApi
      .proMembers()
      .then((res) => setProMembers(res.data))
      .finally(() => setProLoading(false));
  }, []);

  useEffect(() => {
    setTxLoading(true);
    const handle = setTimeout(() => {
      adminApi
        .earningsTransactions({
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search.trim() || undefined,
        })
        .then((res) => setTransactions(res.data))
        .finally(() => setTxLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [statusFilter, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">Revenue, transactions, and Pro membership — read-only.</p>
        </div>
      </div>

      {/* Section 1: Earnings Overview */}
      <section>
        <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Earnings Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {statsLoading ? "—" : formatCurrency(stats?.total_revenue ?? 0)}
            </p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Revenue This Month</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {statsLoading ? "—" : formatCurrency(stats?.revenue_this_month ?? 0)}
            </p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Revenue Today</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {statsLoading ? "—" : formatCurrency(stats?.revenue_today ?? 0)}
            </p>
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-blue-400 w-5 h-5" />
            <span className="text-[#8b949e] text-sm">Revenue by Plan</span>
          </div>
          {statsLoading ? (
            <p className="text-[#484f58] text-sm">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(PLAN_LABELS).map(([planId, label]) => (
                <div
                  key={planId}
                  className="flex items-center justify-between bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2"
                >
                  <span className="text-[#c9d1d9] text-sm">{label}</span>
                  <span className="text-white text-sm font-semibold">
                    {formatCurrency(stats?.revenue_by_plan?.[planId] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Transactions */}
      <section>
        <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Transactions</h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-1 border-b border-[#30363d]">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  statusFilter === s
                    ? "border-blue-500 text-white"
                    : "border-transparent text-[#8b949e] hover:text-white"
                )}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email…"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#484f58] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
          {txLoading ? (
            <p className="text-[#484f58] text-sm p-5">Loading…</p>
          ) : transactions.length === 0 ? (
            <p className="text-[#484f58] text-sm p-5">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#30363d] text-left text-[#8b949e]">
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 font-medium">Currency</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-[#30363d] last:border-0">
                      <td className="px-5 py-3 text-white whitespace-nowrap">{tx.user_email}</td>
                      <td className="px-5 py-3 text-[#8b949e] whitespace-nowrap">
                        {PLAN_LABELS[tx.plan] ?? tx.plan}
                      </td>
                      <td className="px-5 py-3 text-white text-right whitespace-nowrap">{tx.amount.toFixed(2)}</td>
                      <td className="px-5 py-3 text-[#8b949e] whitespace-nowrap">{tx.currency_code}</td>
                      <td className="px-5 py-3 text-[#8b949e] whitespace-nowrap">{formatDate(tx.created_at)}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center text-xs border px-2 py-0.5 rounded-full capitalize",
                            statusBadgeClass(tx.status)
                          )}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Pro Members */}
      <section>
        <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Pro Members</h2>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
          {proLoading ? (
            <p className="text-[#484f58] text-sm p-5">Loading…</p>
          ) : proMembers.length === 0 ? (
            <p className="text-[#484f58] text-sm p-5">No active Pro members.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#30363d] text-left text-[#8b949e]">
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Pro Until</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {proMembers.map((m) => {
                    const expiringSoon = new Date(m.pro_until).getTime() - Date.now() < SEVEN_DAYS_MS;
                    return (
                      <tr key={m.email} className="border-b border-[#30363d] last:border-0">
                        <td className="px-5 py-3 text-white whitespace-nowrap">{m.email}</td>
                        <td className="px-5 py-3 text-[#8b949e] whitespace-nowrap">
                          {PLAN_LABELS[m.plan] ?? m.plan}
                        </td>
                        <td className="px-5 py-3 text-[#8b949e] whitespace-nowrap">{formatDate(m.pro_until)}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {expiringSoon && (
                            <span className="inline-flex items-center text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                              Expiring soon
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Counts & Reports */}
      <section>
        <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wide mb-3">Counts &amp; Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Total Pro Members</span>
            </div>
            <p className="text-3xl font-bold text-white">{statsLoading ? "—" : stats?.total_pro_members ?? 0}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <UsersIcon className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Total Free Users</span>
            </div>
            <p className="text-3xl font-bold text-white">{statsLoading ? "—" : stats?.total_free_users ?? 0}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Conversion Rate</span>
            </div>
            <p className="text-3xl font-bold text-white">{statsLoading ? "—" : `${stats?.conversion_rate ?? 0}%`}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <UserPlus className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">New Signups (Week)</span>
            </div>
            <p className="text-3xl font-bold text-white">{statsLoading ? "—" : stats?.new_signups_week ?? 0}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <UserPlus className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">New Signups (Month)</span>
            </div>
            <p className="text-3xl font-bold text-white">{statsLoading ? "—" : stats?.new_signups_month ?? 0}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
