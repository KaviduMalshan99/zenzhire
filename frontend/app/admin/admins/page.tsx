"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Copy, KeyRound, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminAdmin } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const [resettingId, setResettingId] = useState<number | null>(null);
  const [resetResult, setResetResult] = useState<{ email: string; new_password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function loadAdmins() {
    setLoading(true);
    adminApi
      .admins()
      .then((res) => setAdmins(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !password) {
      toast.error("Fill in all fields");
      return;
    }
    setCreating(true);
    try {
      await adminApi.createAdmin({ email: email.trim(), full_name: fullName.trim(), password });
      toast.success("Admin account created");
      setEmail("");
      setFullName("");
      setPassword("");
      loadAdmins();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Failed to create admin");
    } finally {
      setCreating(false);
    }
  }

  async function handleResetPassword(id: number) {
    setResettingId(id);
    try {
      const res = await adminApi.resetAdminPassword(id);
      setResetResult(res.data);
      setCopied(false);
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setResettingId(null);
    }
  }

  async function copyPassword() {
    if (!resetResult) return;
    await navigator.clipboard.writeText(resetResult.new_password);
    setCopied(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 w-full space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admins</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">Manage accounts with admin access.</p>
        </div>
      </div>

      {/* Create admin form */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-blue-400" />
          Create new admin
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-[#484f58] outline-none transition-colors"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-[#484f58] outline-none transition-colors"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-[#484f58] outline-none transition-colors"
          />
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
            >
              {creating ? "Creating…" : "Create Admin"}
            </button>
          </div>
        </form>
      </div>

      {/* Admins list */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-[#484f58] text-sm p-5">Loading…</p>
        ) : admins.length === 0 ? (
          <p className="text-[#484f58] text-sm p-5">No admin accounts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d] text-left text-[#8b949e]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">Created</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-[#30363d] last:border-0">
                  <td className="px-5 py-3 text-white whitespace-nowrap">{a.full_name}</td>
                  <td className="px-5 py-3 text-[#c9d1d9] whitespace-nowrap">{a.email}</td>
                  <td className="px-5 py-3 text-[#8b949e] whitespace-nowrap">{formatDate(a.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleResetPassword(a.id)}
                      disabled={resettingId === a.id}
                      className="inline-flex items-center gap-1.5 text-[#8b949e] hover:text-white disabled:opacity-60 text-xs font-medium transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      {resettingId === a.id ? "Resetting…" : "Reset password"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* One-time password reveal */}
      <Dialog open={!!resetResult} onOpenChange={(open) => { if (!open) setResetResult(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password reset</DialogTitle>
            <DialogDescription>
              New password for <span className="text-white">{resetResult?.email}</span>. This is shown
              only once — copy it now and share it securely.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3">
            <code className="text-white text-sm flex-1 break-all">{resetResult?.new_password}</code>
            <button
              onClick={copyPassword}
              className="text-[#8b949e] hover:text-white transition-colors p-1.5 rounded-md hover:bg-[#161b22] shrink-0"
              title="Copy password"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                Done
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
