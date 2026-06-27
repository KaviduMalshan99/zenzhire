"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { coverLetterApi } from "@/lib/api";
import type { CoverLetterListItem } from "@/types";
import { Plus, FileText, Trash2, Loader2 } from "lucide-react";

export default function CoverLetterPage() {
  const router = useRouter();
  const [letters, setLetters] = useState<CoverLetterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
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
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this cover letter?")) return;
    await coverLetterApi.delete(id);
    setLetters((prev) => prev.filter((l) => l.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Cover Letters</h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Create and manage your cover letters
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Cover Letter
        </button>
      </div>

      {letters.length === 0 ? (
        <div className="border border-dashed border-[#30363d] rounded-xl p-16 text-center">
          <FileText className="w-12 h-12 text-[#30363d] mx-auto mb-4" />
          <h3 className="text-[#e6edf3] font-medium mb-2">No cover letters yet</h3>
          <p className="text-[#8b949e] text-sm mb-6">
            Create your first AI-powered cover letter
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-60"
          >
            Create Cover Letter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {letters.map((letter) => (
            <div
              key={letter.id}
              onClick={() => router.push(`/cover-letter/${letter.id}`)}
              className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 cursor-pointer hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-8 h-8 text-blue-400 flex-shrink-0" />
                <button
                  onClick={(e) => handleDelete(letter.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400 transition-all p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-[#e6edf3] font-medium text-sm mb-1 truncate">
                {letter.title}
              </h3>
              {letter.job_title && (
                <p className="text-[#8b949e] text-xs truncate">
                  {letter.job_title}
                  {letter.company && ` @ ${letter.company}`}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-[#30363d] flex items-center justify-between">
                <span className="text-[10px] text-[#484f58] capitalize">
                  {letter.template_id}
                </span>
                <span className="text-[10px] text-[#484f58]">
                  {new Date(letter.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
