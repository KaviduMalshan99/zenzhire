"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Newspaper, Upload, Trash2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import type { CareerTip } from "@/types";
import { formatDate } from "@/lib/utils";
import { RichTextEditor } from "@/components/cv-builder/RichTextEditor";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminCareerTipsPage() {
  const [tips, setTips] = useState<CareerTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [imageData, setImageData] = useState("");
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function loadTips() {
    setLoading(true);
    adminApi
      .careerTips()
      .then((res) => setTips(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTips();
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    const b64 = await fileToBase64(file);
    setImageData(b64);
  }

  async function handlePublish() {
    if (!title.trim()) {
      toast.error("Give the tip a title first");
      return;
    }
    if (!imageData) {
      toast.error("Choose an image first");
      return;
    }
    if (!caption.trim() || caption.trim() === "<p></p>") {
      toast.error("Write some caption content first");
      return;
    }
    setPublishing(true);
    try {
      await adminApi.createCareerTip({ title: title.trim(), image_url: imageData, caption });
      toast.success("Career tip published");
      setTitle("");
      setImageData("");
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      loadTips();
    } catch {
      toast.error("Failed to publish career tip");
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await adminApi.deleteCareerTip(id);
      setTips((prev) => prev.filter((t) => t.id !== id));
      toast.success("Career tip removed");
    } catch {
      toast.error("Failed to remove career tip");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 w-full space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
          <Newspaper className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Career Tips</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">Publish quick career tips shown on the public site.</p>
        </div>
      </div>

      {/* Publish form */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-[#484f58] outline-none transition-colors"
            placeholder="5 resume mistakes that cost interviews"
          />
        </div>

        <div className="flex items-start gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative shrink-0 rounded-lg border-2 border-dashed border-[#30363d] hover:border-blue-500 overflow-hidden transition-colors bg-[#0d1117] flex items-center justify-center"
            style={{ width: 220, height: 260 }}
          >
            {imageData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageData}
                alt="Selected career tip"
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-[#8b949e] px-4 text-center">
                <Upload className="w-5 h-5" />
                <span className="text-xs">Upload image</span>
                <span className="text-[10px] text-[#484f58]">Facebook-post size, e.g. 1080×1350</span>
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

          <div className="flex-1 min-w-[280px]">
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Caption</label>
            <RichTextEditor value={caption} onChange={setCaption} />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {/* Published list */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Published Tips</h2>
        {loading ? (
          <p className="text-[#484f58] text-sm">Loading…</p>
        ) : tips.length === 0 ? (
          <div className="border border-dashed border-[#30363d] rounded-lg p-10 text-center">
            <ImageOff className="w-6 h-6 text-[#484f58] mx-auto mb-2" />
            <p className="text-[#8b949e] text-sm">No career tips published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip) => (
              <div key={tip.id} className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                <div className="relative w-full aspect-video bg-[#0d1117]">
                  <Image src={tip.image_url} alt={tip.title} fill className="object-cover" unoptimized />
                </div>
                <div className="p-4">
                  <p className="text-white text-sm font-medium leading-relaxed line-clamp-2">{tip.title}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[#8b949e] text-xs">{formatDate(tip.published_at)}</span>
                    <button
                      onClick={() => handleDelete(tip.id)}
                      disabled={deletingId === tip.id}
                      className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 disabled:opacity-60 text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === tip.id ? "Removing…" : "Unpublish"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
