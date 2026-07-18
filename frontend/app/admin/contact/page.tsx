"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { adminApi, type AdminContactSubmission } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState<AdminContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .contactSubmissions()
      .then((res) => setSubmissions(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Submissions</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">Messages sent through the public contact form.</p>
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-[#484f58] text-sm p-5">Loading…</p>
        ) : submissions.length === 0 ? (
          <p className="text-[#484f58] text-sm p-5">No contact submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-left text-[#8b949e]">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Message</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((c) => (
                  <tr key={c.id} className="border-b border-[#30363d] last:border-0 align-top">
                    <td className="px-5 py-3 text-white whitespace-nowrap">{c.name}</td>
                    <td className="px-5 py-3 text-[#c9d1d9] whitespace-nowrap">{c.email}</td>
                    <td className="px-5 py-3 text-[#c9d1d9] max-w-md">{c.message}</td>
                    <td className="px-5 py-3 text-[#8b949e] whitespace-nowrap">{formatDate(c.created_at)}</td>
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
