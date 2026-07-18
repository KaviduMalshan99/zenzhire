"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type ReviewItem } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";

type Tab = "pending" | "approved";

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState<ReviewItem[]>([]);
  const [approved, setApproved] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminApi.pendingReviews(), adminApi.approvedReviews()])
      .then(([p, a]) => {
        setPending(p.data);
        setApproved(a.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: number) {
    setApprovingId(id);
    try {
      const res = await adminApi.approveReview(id);
      setPending((prev) => prev.filter((r) => r.id !== id));
      setApproved((prev) => [res.data, ...prev]);
      toast.success("Review approved");
    } catch {
      toast.error("Failed to approve review");
    } finally {
      setApprovingId(null);
    }
  }

  const rows = tab === "pending" ? pending : approved;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
          <Star className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">Moderate testimonials submitted by users.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#30363d]">
        {(["pending", "approved"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize",
              tab === t
                ? "border-blue-500 text-white"
                : "border-transparent text-[#8b949e] hover:text-white"
            )}
          >
            {t} {!loading && (t === "pending" ? `(${pending.length})` : `(${approved.length})`)}
          </button>
        ))}
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-[#484f58] text-sm p-5">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-[#484f58] text-sm p-5">
            No {tab === "pending" ? "pending" : "approved"} reviews.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d] text-left text-[#8b949e]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Text</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">Date</th>
                {tab === "pending" && <th className="px-5 py-3 font-medium text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#30363d] last:border-0 align-top">
                  <td className="px-5 py-3 text-white whitespace-nowrap">{r.name}</td>
                  <td className="px-5 py-3 text-[#c9d1d9] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {r.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#c9d1d9] max-w-md">{r.text}</td>
                  <td className="px-5 py-3 text-[#8b949e] whitespace-nowrap">{formatDate(r.created_at)}</td>
                  {tab === "pending" && (
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleApprove(r.id)}
                        disabled={approvingId === r.id}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {approvingId === r.id ? "Approving…" : "Approve"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
