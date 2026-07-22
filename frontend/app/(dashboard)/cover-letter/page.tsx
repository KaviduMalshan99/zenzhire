"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { coverLetterApi } from "@/lib/api";
import type { CoverLetterListItem } from "@/types";
import { Plus, Loader2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanLimitDialog } from "@/components/shared/PlanLimitDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

const TEMPLATE_LABELS: Record<string, string> = {
  classic: "Classic",
  modern: "Modern",
  colorful: "Colorful",
  executive: "Executive",
  bordered: "Bordered",
  creative: "Timeline",
  inline: "Inline",
  gcc: "GCC",
};

const TEMPLATE_COLORS: Record<string, string> = {
  classic: "#1e3a5f",
  modern: "#2563eb",
  colorful: "#e11d48",
  executive: "#111827",
  bordered: "#0f766e",
  creative: "#7c3aed",
  inline: "#2563eb",
  gcc: "#1d4ed8",
};

function CoverLetterCard({
  letter,
  token,
  onOpen,
  onDuplicate,
  onDelete,
  duplicating,
}: {
  letter: CoverLetterListItem;
  token: string;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  duplicating: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const accentColor = TEMPLATE_COLORS[letter.template_id] ?? "#2563eb";

  return (
    <div className="group flex flex-col bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
      {/* Preview area */}
      <div
        onClick={onOpen}
        className="relative overflow-hidden bg-white cursor-pointer"
        style={{ height: 350 }}
      >
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]">
            <Loader2 className="w-6 h-6 text-[#30363d] animate-spin" />
          </div>
        )}

        <iframe
          src={`/cl-print/${letter.id}?token=${token}&preview=true`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "794px",
            height: "1122px",
            border: "none",
            transformOrigin: "top left",
            transform: `scale(0.40)`,
            pointerEvents: "none",
            opacity: iframeLoaded ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
          onLoad={() => setIframeLoaded(true)}
        />

        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg">
            Open Editor
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="p-4 flex items-center justify-between border-t border-[#30363d]">
        <div onClick={onOpen} className="flex-1 min-w-0 mr-2 cursor-pointer">
          <h3 className="text-[#e6edf3] font-medium text-sm truncate">{letter.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[#484f58]">
              edited{" "}
              {new Date(letter.updated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-[10px] text-[#484f58]">•</span>
            <span className="text-[10px] font-medium" style={{ color: accentColor }}>
              {TEMPLATE_LABELS[letter.template_id] ?? letter.template_id}
            </span>
          </div>
        </div>

        {/* 3-dot menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((p) => !p);
            }}
            className="p-1.5 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 bottom-8 z-20 bg-[#21262d] border border-[#30363d] rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onOpen();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#e6edf3] hover:bg-[#30363d] transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDuplicate();
                  }}
                  disabled={duplicating}
                  className="w-full text-left px-3 py-2 text-xs text-[#e6edf3] hover:bg-[#30363d] transition-colors disabled:opacity-50"
                >
                  {duplicating ? "⏳ Duplicating..." : "📋 Duplicate"}
                </button>
                <div className="border-t border-[#30363d]" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoverLetterPage() {
  const router = useRouter();
  const [letters, setLetters] = useState<CoverLetterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [duplicating, setDuplicating] = useState<number | null>(null);
  const [token, setToken] = useState("");
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CoverLetterListItem | null>(null);

  useEffect(() => {
    setToken(Cookies.get("token") ?? "");
    coverLetterApi
      .list()
      .then((res) => setLetters(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await coverLetterApi.create({
        title: "My Cover Letter",
        template_id: "classic",
        job_title: "",
        company: "",
      });
      router.push(`/cover-letter/${res.data.id}`);
    } catch (err: any) {
      setLimitMessage(err?.response?.data?.detail || "Failed to create cover letter. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    await coverLetterApi.delete(id);
    setLetters((prev) => prev.filter((l) => l.id !== id));
  };

  const handleDuplicate = async (id: number) => {
    setDuplicating(id);
    try {
      const res = await coverLetterApi.duplicate(id);
      setLetters((prev) => [...prev, res.data]);
    } catch (err: any) {
      setLimitMessage(err?.response?.data?.detail || "Failed to duplicate cover letter. Please try again.");
    } finally {
      setDuplicating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-10 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Cover Letters</h1>
          <p className="text-[#8b949e] text-sm mt-1">
            {letters.length === 0
              ? "Create your first cover letter"
              : `${letters.length} cover letter${letters.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-60"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Cover Letter
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 320px))", justifyContent: "start" }}>
        {/* New cover letter card */}
        <div
          onClick={handleCreate}
          className={cn(
            "flex flex-col items-center justify-center gap-3",
            "border-2 border-dashed border-[#30363d] rounded-xl",
            "cursor-pointer min-h-[420px]",
            "hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group"
          )}
        >
          <div className="w-14 h-14 rounded-full bg-[#21262d] flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
            <Plus className="w-6 h-6 text-[#8b949e] group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-[#e6edf3] text-sm font-medium">New Cover Letter</p>
            <p className="text-[#484f58] text-xs mt-1">Start writing</p>
          </div>
        </div>

        {/* Existing cover letters */}
        {letters.map((letter) => (
          <CoverLetterCard
            key={letter.id}
            letter={letter}
            token={token}
            onOpen={() => router.push(`/cover-letter/${letter.id}`)}
            onDuplicate={() => handleDuplicate(letter.id)}
            onDelete={() => setPendingDelete(letter)}
            duplicating={duplicating === letter.id}
          />
        ))}
      </div>

      <PlanLimitDialog message={limitMessage} onClose={() => setLimitMessage(null)} />
      <DeleteConfirmDialog
        open={!!pendingDelete}
        title="Delete Cover Letter"
        itemName={pendingDelete?.title}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
