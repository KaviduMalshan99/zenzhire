"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FileText, Target, Plus, ArrowRight, TrendingUp, Clock, MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import type { ATSHistoryItem, CVDocument } from "@/types";
import { formatDate, scoreColor } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// ── CV card with inline rename + dropdown menu ─────────────────────────────────

function CVCard({
  cv,
  onDelete,
  onRename,
  onDuplicate,
}: {
  cv: CVDocument;
  onDelete: (cv: CVDocument) => void;
  onRename: (cv: CVDocument, newTitle: string) => void;
  onDuplicate: (cv: CVDocument) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(cv.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  function startRename() {
    setDraft(cv.title);
    setRenaming(true);
  }

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== cv.title) {
      onRename(cv, trimmed);
    }
    setRenaming(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setRenaming(false);
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-5 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="text-[#8b949e] w-4 h-4 shrink-0" />
        <div className="min-w-0">
          {renaming ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              className="bg-[#0d1117] border border-blue-600 rounded px-2 py-0.5 text-sm text-white w-48 focus:outline-none"
            />
          ) : (
            <p className="text-white text-sm font-medium truncate">{cv.title}</p>
          )}
          <p className="text-[#8b949e] text-xs mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDate(cv.created_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/cv-builder?id=${cv.id}`}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          Edit
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors focus:outline-none">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={startRename}>
              <Pencil className="w-3.5 h-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(cv)}>
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(cv)}
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ── Delete confirmation dialog ─────────────────────────────────────────────────

function DeleteDialog({
  cv,
  onClose,
  onConfirm,
}: {
  cv: CVDocument | null;
  onClose: () => void;
  onConfirm: (cv: CVDocument) => void;
}) {
  return (
    <Dialog open={!!cv} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete CV</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{cv?.title}&rdquo;?{" "}
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-md text-sm text-[#8b949e] hover:text-white border border-[#30363d] hover:border-[#8b949e] transition-colors">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={() => cv && onConfirm(cv)}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Dashboard page ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CVDocument[]>([]);
  const [atsHistory, setAtsHistory] = useState<ATSHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<CVDocument | null>(null);

  useEffect(() => {
    Promise.all([api.get<CVDocument[]>("/cv/"), api.get<ATSHistoryItem[]>("/ats/history")])
      .then(([cvRes, atsRes]) => {
        setCvs(cvRes.data);
        setAtsHistory(atsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleRename(cv: CVDocument, newTitle: string) {
    try {
      await api.put(`/cv/${cv.id}`, { title: newTitle });
      setCvs((prev) => prev.map((c) => (c.id === cv.id ? { ...c, title: newTitle } : c)));
      toast.success("CV renamed successfully");
    } catch {
      toast.error("Failed to rename CV");
    }
  }

  async function handleDuplicate(cv: CVDocument) {
    try {
      const res = await api.post<CVDocument>(`/cv/${cv.id}/duplicate`);
      setCvs((prev) => [res.data, ...prev]);
      toast.success("CV duplicated successfully");
    } catch {
      toast.error("Failed to duplicate CV");
    }
  }

  async function handleDeleteConfirm(cv: CVDocument) {
    setPendingDelete(null);
    try {
      await api.delete(`/cv/${cv.id}`);
      setCvs((prev) => prev.filter((c) => c.id !== cv.id));
      toast.success("CV deleted successfully");
    } catch {
      toast.error("Failed to delete CV");
    }
  }

  const latestScore = atsHistory[0]?.overall_score;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.full_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-[#8b949e] mt-1">Here&apos;s an overview of your career toolkit.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Saved CVs</span>
            </div>
            <p className="text-3xl font-bold text-white">{loading ? "—" : cvs.length}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <Target className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">ATS Checks</span>
            </div>
            <p className="text-3xl font-bold text-white">{loading ? "—" : atsHistory.length}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="text-blue-400 w-5 h-5" />
              <span className="text-[#8b949e] text-sm">Latest Score</span>
            </div>
            <p className={`text-3xl font-bold ${latestScore != null ? scoreColor(latestScore) : "text-white"}`}>
              {loading ? "—" : latestScore != null ? `${latestScore.toFixed(0)}%` : "N/A"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/cv-builder"
            className="bg-[#161b22] border border-[#30363d] hover:border-blue-600/50 rounded-lg p-6 flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Plus className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">Create New CV</p>
                <p className="text-[#8b949e] text-sm mt-0.5">Build and export a professional CV</p>
              </div>
            </div>
            <ArrowRight className="text-[#8b949e] group-hover:text-white transition-colors w-5 h-5" />
          </Link>

          <Link
            href="/ats-checker"
            className="bg-[#161b22] border border-[#30363d] hover:border-blue-600/50 rounded-lg p-6 flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Target className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">Check ATS Score</p>
                <p className="text-[#8b949e] text-sm mt-0.5">Upload CV and get AI feedback</p>
              </div>
            </div>
            <ArrowRight className="text-[#8b949e] group-hover:text-white transition-colors w-5 h-5" />
          </Link>
        </div>

        {/* Recent CVs */}
        {!loading && cvs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent CVs</h2>
              <Link href="/cv-builder" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {cvs.slice(0, 3).map((cv) => (
                <CVCard
                  key={cv.id}
                  cv={cv}
                  onDelete={setPendingDelete}
                  onRename={handleRename}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent ATS Checks */}
        {!loading && atsHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent ATS Checks</h2>
              <Link href="/ats-checker" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                New check
              </Link>
            </div>
            <div className="space-y-3">
              {atsHistory.slice(0, 3).map((result) => (
                <div key={result.id} className="bg-[#161b22] border border-[#30363d] rounded-lg px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="text-[#8b949e] w-4 h-4" />
                    <div>
                      <p className="text-white text-sm font-medium">{result.cv_filename}</p>
                      <p className="text-[#8b949e] text-xs mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(result.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${scoreColor(result.overall_score)}`}>
                    {result.overall_score.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        cv={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
