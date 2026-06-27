"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, GripVertical, X, Camera } from "lucide-react";
import type { CVSection } from "@/types";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./RichTextEditor";

interface FormProps {
  section: CVSection;
  onChange: (data: Record<string, any>) => void;
}

// ── Shared field helpers ───────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors text-xs";

const labelCls = "block text-[10px] text-[#8b949e] mb-1 uppercase tracking-wide";

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = "text",
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}

function Select({
  value, onChange, options, className,
}: { value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputCls, className)}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2">{children}</div>
  );
}

function newId() {
  return Math.random().toString(36).slice(2);
}

function PhotoUpload({
  value,
  onChange,
  shape = "circle",
  onShapeChange,
  size = 80,
  onSizeChange,
}: {
  value: string;
  onChange: (b64: string) => void;
  shape?: string;
  onShapeChange?: (s: string) => void;
  size?: number;
  onSizeChange?: (s: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const FRAME_SIZE = 260;

  const getBorderRadius = (s: string) => {
    switch (s) {
      case "circle": return "50%";
      case "rounded": return "16px";
      case "square": return "0px";
      case "hexagon": return "0px";
      default: return "50%";
    }
  };

  const getClipPath = (s: string) => {
    if (s === "hexagon") return "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
    return "none";
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Photo must be under 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const img = imgRef.current;
    const scale = zoom;
    const imgW = img.naturalWidth * scale * (FRAME_SIZE / img.naturalWidth);
    const imgH = img.naturalHeight * scale * (FRAME_SIZE / img.naturalWidth);

    ctx.clearRect(0, 0, outputSize, outputSize);

    const scaleToOutput = outputSize / FRAME_SIZE;

    ctx.drawImage(
      img,
      (position.x + FRAME_SIZE / 2 - imgW / 2) * scaleToOutput,
      (position.y + FRAME_SIZE / 2 - imgH / 2) * scaleToOutput,
      imgW * scaleToOutput,
      imgH * scaleToOutput,
    );

    onChange(canvas.toDataURL("image/jpeg", 0.9));
    setShowCropper(false);
  };

  const SHAPES = [
    { id: "circle", label: "Circle" },
    { id: "rounded", label: "Rounded" },
    { id: "square", label: "Square" },
    { id: "hexagon", label: "Hexagon" },
  ];

  return (
    <div className="space-y-3">
      {/* Photo preview + upload button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex-shrink-0 border-2 border-dashed border-[#30363d] hover:border-blue-500 flex items-center justify-center overflow-hidden transition-colors bg-[#0d1117]"
          style={{
            width: 64,
            height: 64,
            borderRadius: getBorderRadius(shape),
            clipPath: getClipPath(shape),
          }}
        >
          {value ? (
            <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Camera className="w-5 h-5 text-[#8b949e]" />
          )}
        </button>

        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={() => fileRef.current?.click()} className="text-[11px] text-blue-400 hover:text-blue-300">
            {value ? "Change photo" : "Upload photo"}
          </button>
          {value && (
            <>
              <button
                type="button"
                onClick={() => { setRawImage(value); setZoom(1); setPosition({ x: 0, y: 0 }); setShowCropper(true); }}
                className="text-[11px] text-[#8b949e] hover:text-white"
              >
                Adjust crop
              </button>
              <button type="button" onClick={() => onChange("")} className="text-[11px] text-red-400 hover:text-red-300">
                Remove
              </button>
            </>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      </div>

      {/* Shape selection */}
      {onShapeChange && (
        <div>
          <span className={labelCls}>Photo Shape</span>
          <div className="grid grid-cols-4 gap-1 mt-1">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onShapeChange(s.id)}
                className={cn(
                  "py-1.5 px-1 rounded border text-[10px] transition-colors text-center",
                  shape === s.id
                    ? "border-blue-500 bg-blue-600/10 text-blue-400"
                    : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size slider */}
      {onSizeChange && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={labelCls}>Photo Size</span>
            <span className="text-[10px] text-[#8b949e]">{size}px</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8b949e]">S</span>
            <input
              type="range"
              min={50}
              max={150}
              step={5}
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-[10px] text-[#8b949e]">L</span>
          </div>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Crop Modal */}
      {showCropper && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCropper(false); }}
        >
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col items-center gap-4 shadow-2xl max-w-sm w-full mx-4">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-white text-sm font-semibold">Adjust Photo</h3>
              <button onClick={() => setShowCropper(false)} className="text-[#8b949e] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Crop frame */}
            <div
              style={{
                width: FRAME_SIZE,
                height: FRAME_SIZE,
                overflow: "hidden",
                position: "relative",
                cursor: dragging ? "grabbing" : "grab",
                backgroundColor: "#0d1117",
                borderRadius: getBorderRadius(shape),
                clipPath: getClipPath(shape),
                border: "2px solid #30363d",
                userSelect: "none",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              {rawImage && (
                <img
                  ref={imgRef}
                  src={rawImage}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: "center",
                    maxWidth: "none",
                    width: FRAME_SIZE,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              )}
            </div>

            {/* Zoom slider */}
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-[#8b949e]">Zoom</span>
                <span className="text-[10px] text-[#8b949e]">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8b949e]">🔍-</span>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-[10px] text-[#8b949e]">🔍+</span>
              </div>
            </div>

            <p className="text-[10px] text-[#8b949e] text-center">Drag to reposition · Scroll to zoom</p>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowCropper(false)}
                className="flex-1 py-2 rounded-md border border-[#30363d] text-[#8b949e] hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 1. Personal Details ────────────────────────────────────────────────────────

function PersonalDetailsForm({ section, onChange }: FormProps) {
  const d = section.data;
  const update = (key: string, val: any) => onChange({ ...d, [key]: val });

  const addLink = () =>
    update("links", [...(d.links ?? []), { id: newId(), platform: "LinkedIn", url: "" }]);
  const updateLink = (idx: number, key: string, val: string) => {
    const links = [...(d.links ?? [])];
    links[idx] = { ...links[idx], [key]: val };
    update("links", links);
  };
  const removeLink = (idx: number) =>
    update("links", (d.links ?? []).filter((_: any, i: number) => i !== idx));

  return (
    <div className="space-y-4">
      <Row>
        <Field label="Full Name" required><Input value={d.full_name ?? ""} onChange={(v) => update("full_name", v)} /></Field>
        <Field label="Title / Headline"><Input value={d.title ?? ""} onChange={(v) => update("title", v)} placeholder="e.g. Software Engineer" /></Field>
      </Row>
      <Row>
        <Field label="Email" required><Input value={d.email ?? ""} onChange={(v) => update("email", v)} type="email" /></Field>
        <Field label="Phone"><Input value={d.phone ?? ""} onChange={(v) => update("phone", v)} /></Field>
      </Row>
      <Row>
        <Field label="Location"><Input value={d.location ?? ""} onChange={(v) => update("location", v)} placeholder="City, Country" /></Field>
        <Field label="Date of Birth"><Input value={d.date_of_birth ?? ""} onChange={(v) => update("date_of_birth", v)} placeholder="YYYY-MM-DD" /></Field>
      </Row>
      <Row>
        <Field label="Nationality"><Input value={d.nationality ?? ""} onChange={(v) => update("nationality", v)} /></Field>
        <Field label="Visa Status"><Input value={d.visa_status ?? ""} onChange={(v) => update("visa_status", v)} /></Field>
      </Row>
      <Row>
        <Field label="Gender"><Input value={d.gender ?? ""} onChange={(v) => update("gender", v)} /></Field>
        <Field label="Marital Status">
          <select
            value={d.marital_status ?? ""}
            onChange={(e) => update("marital_status", e.target.value)}
            className={inputCls}
          >
            <option value="">Select status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
        </Field>
      </Row>
      <Row>
        <Field label="Religion">
          <Input value={d.religion ?? ""} onChange={(v) => update("religion", v)} placeholder="e.g. Buddhist" />
        </Field>
        <Field label="NIC / ID Number">
          <Input value={d.nic ?? ""} onChange={(v) => update("nic", v)} placeholder="National ID number" />
        </Field>
      </Row>
      <Row>
        <Field label="Driving License">
          <Input value={d.driving_license ?? ""} onChange={(v) => update("driving_license", v)} placeholder="License number" />
        </Field>
      </Row>
      <div className="border-t border-[#30363d] pt-1" />
      <div>
        <span className={labelCls}>Profile Photo</span>
        <PhotoUpload
          value={d.photo_base64 ?? ""}
          onChange={(b64) => update("photo_base64", b64)}
          shape={d.photo_shape ?? "circle"}
          onShapeChange={(s) => update("photo_shape", s)}
          size={d.photo_size ?? 80}
          onSizeChange={(s) => update("photo_size", s)}
        />
        <p className="text-[9px] text-[#8b949e] mt-1.5">Hidden in Classic template (ATS-friendly). Max 5 MB · JPG, PNG or WebP.</p>
      </div>
      <div className="border-t border-[#30363d] pt-1" />

      {/* Links — 2-row layout per entry */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={labelCls}>Links</span>
          <button onClick={addLink} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add link
          </button>
        </div>
        <div className="space-y-3">
          {(d.links ?? []).map((link: any, i: number) => (
            <div key={link.id ?? i} className="border border-[#30363d] rounded-md p-2.5 space-y-1.5 relative">
              <button
                onClick={() => removeLink(i)}
                className="absolute top-2 right-2 text-[#8b949e] hover:text-red-400 transition-colors"
                title="Remove link"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {/* Row 1: platform full width */}
              <Select
                value={link.platform}
                onChange={(v) => updateLink(i, "platform", v)}
                options={["LinkedIn", "GitHub", "Portfolio", "Twitter", "Instagram", "YouTube", "Website", "Other"]}
                className="pr-6"
              />
              {/* Row 2: URL full width */}
              <Input value={link.url} onChange={(v) => updateLink(i, "url", v)} placeholder="https://..." />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 2. Profile Summary ─────────────────────────────────────────────────────────

function ProfileSummaryForm({ section, onChange }: FormProps) {
  const d = section.data;
  return (
    <div className="space-y-2">
      <RichTextEditor
        value={d.summary ?? ""}
        onChange={(html) => onChange({ ...d, summary: html })}
      />
      <p className="text-[10px] text-[#8b949e]">Write a compelling professional summary. Use bullet points or paragraphs.</p>
    </div>
  );
}

// ── 3. Experience ──────────────────────────────────────────────────────────────

function ExperienceForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const updateEntries = (newEntries: any[]) => onChange({ ...d, entries: newEntries });
  const addEntry = () => updateEntries([...entries, {
    id: newId(), job_title: "", employer: "", employer_link: "", location: "",
    start_date: "", end_date: "", current: false, description: "",
  }]);
  const removeEntry = (id: string) => updateEntries(entries.filter((e) => e.id !== id));
  const updateEntry = (id: string, key: string, val: any) =>
    updateEntries(entries.map((e) => e.id === id ? { ...e, [key]: val } : e));
  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <div className="space-y-3">
      <button onClick={addEntry} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Experience
      </button>
      {entries.map((entry) => {
        const isCollapsed = collapsed.has(entry.id);
        return (
          <div key={entry.id} className="border border-[#30363d] rounded-md overflow-hidden cv-entry">
            <div
              className="flex items-center justify-between px-3 py-2 bg-[#0d1117] cursor-pointer"
              onClick={() => toggleCollapse(entry.id)}
            >
              <span className="text-xs text-[#e6edf3] font-medium truncate flex-1">
                {entry.job_title || entry.employer || "New Entry"}
              </span>
              <button onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }} className="text-[#8b949e] hover:text-red-400 p-0.5">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            {!isCollapsed && (
              <div className="p-3 space-y-2">
                <Row>
                  <Field label="Job Title" required><Input value={entry.job_title} onChange={(v) => updateEntry(entry.id, "job_title", v)} /></Field>
                  <Field label="Employer" required><Input value={entry.employer} onChange={(v) => updateEntry(entry.id, "employer", v)} /></Field>
                </Row>
                <Row>
                  <Field label="Employer URL">
                    <div className="flex gap-1.5 items-center">
                      <Input value={entry.employer_link} onChange={(v) => updateEntry(entry.id, "employer_link", v)} placeholder="https://..." />
                      {entry.employer_link && (
                        <a href={entry.employer_link.startsWith("http") ? entry.employer_link : `https://${entry.employer_link}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex-shrink-0" title="Open link">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      )}
                    </div>
                  </Field>
                  <Field label="Location"><Input value={entry.location} onChange={(v) => updateEntry(entry.id, "location", v)} /></Field>
                </Row>
                <Row>
                  <Field label="Start Date"><Input value={entry.start_date} onChange={(v) => updateEntry(entry.id, "start_date", v)} placeholder="Jan 2022" /></Field>
                  <Field label="End Date"><Input value={entry.end_date} onChange={(v) => updateEntry(entry.id, "end_date", v)} placeholder="Dec 2023" /></Field>
                </Row>
                <label className="flex items-center gap-2 text-xs text-[#8b949e] cursor-pointer">
                  <input type="checkbox" checked={entry.current} onChange={(e) => updateEntry(entry.id, "current", e.target.checked)} className="accent-blue-500" />
                  Currently working here
                </label>
                <Field label="Description / Achievements">
                  <RichTextEditor
                    value={entry.description ?? ""}
                    onChange={(html) => updateEntry(entry.id, "description", html)}
                  />
                </Field>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 4. Education ───────────────────────────────────────────────────────────────

function EducationForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];

  const addEntry = () => onChange({ ...d, entries: [...entries, { id: newId(), degree: "", institution: "", institution_link: "", location: "", start_date: "", end_date: "", score_type: "", score_value: "", description: "" }] });
  const removeEntry = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const updateEntry = (id: string, key: string, val: any) =>
    onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [key]: val } : e) });

  return (
    <div className="space-y-3">
      <button onClick={addEntry} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Education
      </button>
      {entries.map((entry) => (
        <div key={entry.id} className="border border-[#30363d] rounded-md p-3 space-y-2 relative cv-entry">
          <button onClick={() => removeEntry(entry.id)} className="absolute top-2 right-2 text-[#8b949e] hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <Row>
            <Field label="Degree / Course Name" required><Input value={entry.degree} onChange={(v) => updateEntry(entry.id, "degree", v)} /></Field>
            <Field label="Institution" required><Input value={entry.institution} onChange={(v) => updateEntry(entry.id, "institution", v)} /></Field>
          </Row>
          <Row>
            <Field label="Institution URL">
              <div className="flex gap-1.5 items-center">
                <Input value={entry.institution_link} onChange={(v) => updateEntry(entry.id, "institution_link", v)} placeholder="https://..." />
                {entry.institution_link && (
                  <a href={entry.institution_link.startsWith("http") ? entry.institution_link : `https://${entry.institution_link}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex-shrink-0" title="Open link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                )}
              </div>
            </Field>
            <Field label="Location"><Input value={entry.location} onChange={(v) => updateEntry(entry.id, "location", v)} /></Field>
          </Row>
          <Row>
            <Field label="Start Date"><Input value={entry.start_date} onChange={(v) => updateEntry(entry.id, "start_date", v)} placeholder="Sep 2018" /></Field>
            <Field label="End Date"><Input value={entry.end_date} onChange={(v) => updateEntry(entry.id, "end_date", v)} placeholder="Jun 2022" /></Field>
          </Row>
          <Row>
            <Field label="Score Type">
              <select
                value={entry.score_type ?? ""}
                onChange={(e) => updateEntry(entry.id, "score_type", e.target.value)}
                className={inputCls}
              >
                <option value="">Select type</option>
                <option value="GPA">GPA</option>
                <option value="Z-Score">Z-Score</option>
                <option value="Percentage">Percentage</option>
                <option value="Grade">Grade</option>
                <option value="Results">Results</option>
                <option value="Marks">Marks</option>
                <option value="CGPA">CGPA</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Score / Value">
              <Input
                value={entry.score_value ?? ""}
                onChange={(v) => updateEntry(entry.id, "score_value", v)}
                placeholder={
                  entry.score_type === "GPA" ? "e.g. 3.8 / 4.0"
                  : entry.score_type === "Z-Score" ? "e.g. 1.2345"
                  : entry.score_type === "Percentage" ? "e.g. 85%"
                  : entry.score_type === "Grade" ? "e.g. Distinction"
                  : entry.score_type === "Results" ? "e.g. 7A 2B 1C"
                  : entry.score_type === "Marks" ? "e.g. 450 / 500"
                  : entry.score_type === "CGPA" ? "e.g. 3.75 / 4.00"
                  : "Score or grade"
                }
              />
            </Field>
          </Row>
          <Field label="Description">
            <RichTextEditor
              value={entry.description ?? ""}
              onChange={(html) => updateEntry(entry.id, "description", html)}
            />
          </Field>
        </div>
      ))}
    </div>
  );
}

// ── 5. Skills ──────────────────────────────────────────────────────────────────

const SKILL_LEVELS_TEXT = ["", "Beginner", "Intermediate", "Advanced"];
const SKILL_LEVELS_NUM = ["", "1", "2", "3", "4", "5"];

function SkillsForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const style: "text" | "numbers" = d.display_style ?? "text";
  const levels = style === "numbers" ? SKILL_LEVELS_NUM : SKILL_LEVELS_TEXT;

  const addEntry = () => onChange({ ...d, entries: [...entries, { id: newId(), skill_name: "", level: "", subskills: "" }] });
  const removeEntry = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const updateEntry = (id: string, key: string, val: any) =>
    onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [key]: val } : e) });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={labelCls}>Level display:</span>
        <button
          onClick={() => onChange({ ...d, display_style: style === "text" ? "numbers" : "text" })}
          className="text-[10px] px-2 py-1 border border-[#30363d] rounded text-[#8b949e] hover:text-white transition-colors"
        >
          {style === "text" ? "Switch to 1–5" : "Switch to text"}
        </button>
      </div>

      <button onClick={addEntry} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Skill
      </button>

      <div className="space-y-2.5">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-1.5">
            <div className="flex gap-1.5 items-center">
              <input
                value={entry.skill_name}
                onChange={(e) => updateEntry(entry.id, "skill_name", e.target.value)}
                placeholder="e.g. React"
                className={cn(inputCls, "flex-1 min-w-0")}
              />
              <select
                value={entry.level ?? ""}
                onChange={(e) => updateEntry(entry.id, "level", e.target.value)}
                className={cn(inputCls, "w-24 flex-shrink-0")}
              >
                <option value="">No level</option>
                {levels.filter((l) => l !== "").map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={() => removeEntry(entry.id)} className="text-[#8b949e] hover:text-red-400 flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div>
              <span className="block text-[9px] text-[#8b949e] mb-1 uppercase tracking-wide">Subskills / Details</span>
              <RichTextEditor
                value={entry.subskills ?? ""}
                onChange={(html) => updateEntry(entry.id, "subskills", html)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 6. Languages ──────────────────────────────────────────────────────────────

const LANG_LEVELS = ["Native", "Fluent", "Professional", "Basic", "A1", "A2", "B1", "B2", "C1", "C2"];

function LanguagesForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];

  const addEntry = () => onChange({ ...d, entries: [...entries, { id: newId(), language: "", level: "Professional", info: "" }] });
  const removeEntry = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const updateEntry = (id: string, key: string, val: any) =>
    onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [key]: val } : e) });

  return (
    <div className="space-y-3">
      <button onClick={addEntry} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Language
      </button>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-1.5">
            <div className="flex gap-1.5 items-center">
              <input
                value={entry.language}
                onChange={(e) => updateEntry(entry.id, "language", e.target.value)}
                placeholder="e.g. English"
                className={cn(inputCls, "flex-1 min-w-0")}
              />
              <select
                value={entry.level}
                onChange={(e) => updateEntry(entry.id, "level", e.target.value)}
                className={cn(inputCls, "w-28 flex-shrink-0")}
              >
                {LANG_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
              <button onClick={() => removeEntry(entry.id)} className="text-[#8b949e] hover:text-red-400 flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
            <Input value={entry.info} onChange={(v) => updateEntry(entry.id, "info", v)} placeholder="Additional notes (optional)" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 7. Projects ────────────────────────────────────────────────────────────────

function ProjectsForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const [tagInput, setTagInput] = useState<Record<string, string>>({});

  const addEntry = () => onChange({ ...d, entries: [...entries, { id: newId(), title: "", subtitle: "", start_date: "", end_date: "", description: "", link: "", tech: [] }] });
  const removeEntry = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const updateEntry = (id: string, key: string, val: any) =>
    onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [key]: val } : e) });
  const addTech = (id: string, tech: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry || !tech.trim()) return;
    updateEntry(id, "tech", [...(entry.tech ?? []), tech.trim()]);
    setTagInput((p) => ({ ...p, [id]: "" }));
  };
  const removeTech = (id: string, idx: number) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    updateEntry(id, "tech", entry.tech.filter((_: any, i: number) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <button onClick={addEntry} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Project
      </button>
      {entries.map((entry) => (
        <div key={entry.id} className="border border-[#30363d] rounded-md p-3 space-y-2 relative cv-entry">
          <button onClick={() => removeEntry(entry.id)} className="absolute top-2 right-2 text-[#8b949e] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          <Row>
            <Field label="Title" required><Input value={entry.title} onChange={(v) => updateEntry(entry.id, "title", v)} /></Field>
            <Field label="Subtitle"><Input value={entry.subtitle} onChange={(v) => updateEntry(entry.id, "subtitle", v)} /></Field>
          </Row>
          <Row>
            <Field label="Start Date"><Input value={entry.start_date} onChange={(v) => updateEntry(entry.id, "start_date", v)} placeholder="Jan 2023" /></Field>
            <Field label="End Date"><Input value={entry.end_date} onChange={(v) => updateEntry(entry.id, "end_date", v)} placeholder="Mar 2023" /></Field>
          </Row>
          <Field label="Description">
            <RichTextEditor
              value={entry.description ?? ""}
              onChange={(html) => updateEntry(entry.id, "description", html)}
            />
          </Field>
          <Field label="Link (GitHub / Demo)">
            <div className="flex gap-1.5 items-center">
              <Input value={entry.link} onChange={(v) => updateEntry(entry.id, "link", v)} placeholder="https://..." />
              {entry.link && (
                <a href={entry.link.startsWith("http") ? entry.link : `https://${entry.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex-shrink-0" title="Open link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              )}
            </div>
          </Field>
          <div>
            <span className={labelCls}>Technologies</span>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {(entry.tech ?? []).map((t: string, i: number) => (
                <span key={i} className="flex items-center gap-1 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full">
                  {t}
                  <button onClick={() => removeTech(entry.id, i)}><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
            <input
              value={tagInput[entry.id] ?? ""}
              onChange={(e) => setTagInput((p) => ({ ...p, [entry.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(entry.id, tagInput[entry.id] ?? ""); } }}
              placeholder="Type tech and press Enter"
              className={inputCls}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 8. Courses ─────────────────────────────────────────────────────────────────

function CoursesForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const add = () => onChange({ ...d, entries: [...entries, { id: newId(), title: "", institution: "", start_date: "", end_date: "", location: "", description: "", link: "" }] });
  const remove = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const upd = (id: string, k: string, v: any) => onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [k]: v } : e) });

  return (
    <div className="space-y-3">
      <button onClick={add} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Course
      </button>
      {entries.map((e) => (
        <div key={e.id} className="border border-[#30363d] rounded-md p-3 space-y-2 relative cv-entry">
          <button onClick={() => remove(e.id)} className="absolute top-2 right-2 text-[#8b949e] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          <Row>
            <Field label="Title" required><Input value={e.title} onChange={(v) => upd(e.id, "title", v)} /></Field>
            <Field label="Institution"><Input value={e.institution} onChange={(v) => upd(e.id, "institution", v)} /></Field>
          </Row>
          <Row>
            <Field label="Start Date"><Input value={e.start_date} onChange={(v) => upd(e.id, "start_date", v)} /></Field>
            <Field label="End Date"><Input value={e.end_date} onChange={(v) => upd(e.id, "end_date", v)} /></Field>
          </Row>
          <Row>
            <Field label="Location"><Input value={e.location} onChange={(v) => upd(e.id, "location", v)} /></Field>
            <Field label="Link">
              <div className="flex gap-1.5 items-center">
                <Input value={e.link} onChange={(v) => upd(e.id, "link", v)} placeholder="https://..." />
                {e.link && (
                  <a href={e.link.startsWith("http") ? e.link : `https://${e.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex-shrink-0" title="Open link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                )}
              </div>
            </Field>
          </Row>
          <Field label="Description">
            <RichTextEditor value={e.description ?? ""} onChange={(html) => upd(e.id, "description", html)} />
          </Field>
        </div>
      ))}
    </div>
  );
}

// ── 9. Certificates ────────────────────────────────────────────────────────────

function CertificatesForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const add = () => onChange({ ...d, entries: [...entries, { id: newId(), certificate_name: "", issuer: "", date: "", expiry: "", no_expiry: false, credential_id: "", link: "" }] });
  const remove = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const upd = (id: string, k: string, v: any) => onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [k]: v } : e) });

  return (
    <div className="space-y-3">
      <button onClick={add} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Certificate
      </button>
      {entries.map((e) => (
        <div key={e.id} className="border border-[#30363d] rounded-md p-3 space-y-2 relative cv-entry">
          <button onClick={() => remove(e.id)} className="absolute top-2 right-2 text-[#8b949e] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          <Row>
            <Field label="Certificate Name" required><Input value={e.certificate_name} onChange={(v) => upd(e.id, "certificate_name", v)} /></Field>
            <Field label="Issuer"><Input value={e.issuer} onChange={(v) => upd(e.id, "issuer", v)} /></Field>
          </Row>
          <Row>
            <Field label="Date"><Input value={e.date} onChange={(v) => upd(e.id, "date", v)} placeholder="Jan 2023" /></Field>
            <div>
              <label className={labelCls}>Expiry Date</label>
              {e.no_expiry ? (
                <div className="h-7 flex items-center">
                  <span className="text-xs text-[#8b949e] italic">No expiry</span>
                </div>
              ) : (
                <Input value={e.expiry} onChange={(v) => upd(e.id, "expiry", v)} placeholder="Jan 2026" />
              )}
              <label className="flex items-center gap-1.5 text-[10px] text-[#8b949e] cursor-pointer mt-1">
                <input type="checkbox" checked={!!e.no_expiry} onChange={(ev) => upd(e.id, "no_expiry", ev.target.checked)} className="accent-blue-500" />
                No Expiry
              </label>
            </div>
          </Row>
          <Row>
            <Field label="Credential ID"><Input value={e.credential_id} onChange={(v) => upd(e.id, "credential_id", v)} /></Field>
            <Field label="Credential URL">
              <div className="flex gap-1.5 items-center">
                <Input value={e.link} onChange={(v) => upd(e.id, "link", v)} placeholder="https://..." />
                {e.link && (
                  <a href={e.link.startsWith("http") ? e.link : `https://${e.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex-shrink-0" title="Open link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                )}
              </div>
            </Field>
          </Row>
        </div>
      ))}
    </div>
  );
}

// ── 10. Awards ─────────────────────────────────────────────────────────────────

function AwardsForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const add = () => onChange({ ...d, entries: [...entries, { id: newId(), award_name: "", issuer: "", date: "", description: "" }] });
  const remove = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const upd = (id: string, k: string, v: any) => onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [k]: v } : e) });

  return (
    <div className="space-y-3">
      <button onClick={add} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Award
      </button>
      {entries.map((e) => (
        <div key={e.id} className="border border-[#30363d] rounded-md p-3 space-y-2 relative cv-entry">
          <button onClick={() => remove(e.id)} className="absolute top-2 right-2 text-[#8b949e] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          <Row>
            <Field label="Award Name" required><Input value={e.award_name} onChange={(v) => upd(e.id, "award_name", v)} /></Field>
            <Field label="Issuer"><Input value={e.issuer} onChange={(v) => upd(e.id, "issuer", v)} /></Field>
          </Row>
          <Field label="Date"><Input value={e.date} onChange={(v) => upd(e.id, "date", v)} placeholder="Jan 2023" /></Field>
          <Field label="Description">
            <RichTextEditor value={e.description ?? ""} onChange={(html) => upd(e.id, "description", html)} />
          </Field>
        </div>
      ))}
    </div>
  );
}

// ── 11. Interests ──────────────────────────────────────────────────────────────

function InterestsForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const add = () => onChange({ ...d, entries: [...entries, { id: newId(), title: "", info: "", link: "" }] });
  const remove = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const upd = (id: string, k: string, v: any) => onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [k]: v } : e) });

  return (
    <div className="space-y-3">
      <button onClick={add} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Interest
      </button>
      {entries.map((e) => (
        <div key={e.id} className="flex gap-1.5 items-start">
          <div className="flex-1 space-y-1.5">
            <Input value={e.title} onChange={(v) => upd(e.id, "title", v)} placeholder="Interest title" />
            <Input value={e.info} onChange={(v) => upd(e.id, "info", v)} placeholder="Details (optional)" />
            <Input value={e.link} onChange={(v) => upd(e.id, "link", v)} placeholder="Link (optional)" />
          </div>
          <button onClick={() => remove(e.id)} className="text-[#8b949e] hover:text-red-400 mt-1 flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
}

// ── 12. Publications ───────────────────────────────────────────────────────────

function PublicationsForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const add = () => onChange({ ...d, entries: [...entries, { id: newId(), title: "", publisher: "", date: "", description: "", link: "" }] });
  const remove = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const upd = (id: string, k: string, v: any) => onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [k]: v } : e) });

  return (
    <div className="space-y-3">
      <button onClick={add} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Publication
      </button>
      {entries.map((e) => (
        <div key={e.id} className="border border-[#30363d] rounded-md p-3 space-y-2 relative cv-entry">
          <button onClick={() => remove(e.id)} className="absolute top-2 right-2 text-[#8b949e] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          <Row>
            <Field label="Title" required><Input value={e.title} onChange={(v) => upd(e.id, "title", v)} /></Field>
            <Field label="Publisher"><Input value={e.publisher} onChange={(v) => upd(e.id, "publisher", v)} /></Field>
          </Row>
          <Row>
            <Field label="Date"><Input value={e.date} onChange={(v) => upd(e.id, "date", v)} /></Field>
            <Field label="DOI / Link"><Input value={e.link} onChange={(v) => upd(e.id, "link", v)} placeholder="https://..." /></Field>
          </Row>
          <Field label="Description">
            <RichTextEditor value={e.description ?? ""} onChange={(html) => upd(e.id, "description", html)} />
          </Field>
        </div>
      ))}
    </div>
  );
}

// ── 13. Organizations ──────────────────────────────────────────────────────────

function OrganizationsForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const add = () => onChange({ ...d, entries: [...entries, { id: newId(), name: "", position: "", start_date: "", end_date: "", current_flag: false, location: "", description: "" }] });
  const remove = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const upd = (id: string, k: string, v: any) => onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [k]: v } : e) });

  return (
    <div className="space-y-3">
      <button onClick={add} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Organization
      </button>
      {entries.map((e) => (
        <div key={e.id} className="border border-[#30363d] rounded-md p-3 space-y-2 relative cv-entry">
          <button onClick={() => remove(e.id)} className="absolute top-2 right-2 text-[#8b949e] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          <Row>
            <Field label="Organization Name" required><Input value={e.name} onChange={(v) => upd(e.id, "name", v)} /></Field>
            <Field label="Your Role / Position"><Input value={e.position} onChange={(v) => upd(e.id, "position", v)} /></Field>
          </Row>
          <Row>
            <Field label="Start Date"><Input value={e.start_date} onChange={(v) => upd(e.id, "start_date", v)} /></Field>
            <Field label="End Date">
              <Input value={e.end_date} onChange={(v) => upd(e.id, "end_date", v)} placeholder={e.current_flag ? "Present" : ""} />
            </Field>
          </Row>
          <label className="flex items-center gap-2 text-xs text-[#8b949e] cursor-pointer">
            <input type="checkbox" checked={!!e.current_flag} onChange={(ev) => upd(e.id, "current_flag", ev.target.checked)} className="accent-blue-500" />
            Currently active
          </label>
          <Field label="Location"><Input value={e.location} onChange={(v) => upd(e.id, "location", v)} /></Field>
          <Field label="Description">
            <RichTextEditor value={e.description ?? ""} onChange={(html) => upd(e.id, "description", html)} />
          </Field>
        </div>
      ))}
    </div>
  );
}

// ── 14. References ─────────────────────────────────────────────────────────────

function ReferencesForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const add = () => onChange({ ...d, entries: [...entries, { id: newId(), name: "", job_title: "", organization: "", email: "", phone: "", privacy: "show" }] });
  const remove = (id: string) => onChange({ ...d, entries: entries.filter((e) => e.id !== id) });
  const upd = (id: string, k: string, v: any) => onChange({ ...d, entries: entries.map((e) => e.id === id ? { ...e, [k]: v } : e) });

  return (
    <div className="space-y-3">
      <button onClick={add} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#30363d] rounded-md text-blue-400 hover:border-blue-500/50 text-xs transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Reference
      </button>
      {entries.map((e) => (
        <div key={e.id} className="border border-[#30363d] rounded-md p-3 space-y-2 relative cv-entry">
          <button onClick={() => remove(e.id)} className="absolute top-2 right-2 text-[#8b949e] hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          <Row>
            <Field label="Name" required><Input value={e.name} onChange={(v) => upd(e.id, "name", v)} /></Field>
            <Field label="Job Title"><Input value={e.job_title} onChange={(v) => upd(e.id, "job_title", v)} /></Field>
          </Row>
          <Row>
            <Field label="Organization"><Input value={e.organization} onChange={(v) => upd(e.id, "organization", v)} /></Field>
            <Field label="Email"><Input value={e.email} onChange={(v) => upd(e.id, "email", v)} type="email" /></Field>
          </Row>
          <Field label="Phone"><Input value={e.phone} onChange={(v) => upd(e.id, "phone", v)} /></Field>
          <div>
            <span className={labelCls}>Privacy</span>
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="flex items-center gap-2 text-xs text-[#8b949e] cursor-pointer">
                <input
                  type="radio"
                  name={`privacy-${e.id}`}
                  value="show"
                  checked={(e.privacy ?? "show") === "show"}
                  onChange={() => upd(e.id, "privacy", "show")}
                  className="accent-blue-500"
                />
                Show full details on CV
              </label>
              <label className="flex items-center gap-2 text-xs text-[#8b949e] cursor-pointer">
                <input
                  type="radio"
                  name={`privacy-${e.id}`}
                  value="on_request"
                  checked={e.privacy === "on_request"}
                  onChange={() => upd(e.id, "privacy", "on_request")}
                  className="accent-blue-500"
                />
                Show as &ldquo;Available on request&rdquo;
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 15. Declaration ────────────────────────────────────────────────────────────

const DECLARATION_DEFAULT = "I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.";

function DeclarationForm({ section, onChange }: FormProps) {
  const d = section.data;
  const update = (k: string, v: any) => onChange({ ...d, [k]: v });
  return (
    <div className="space-y-3">
      <Field label="Declaration Text">
        <RichTextEditor
          value={d.text ?? DECLARATION_DEFAULT}
          onChange={(html) => update("text", html)}
        />
      </Field>
      <Row>
        <Field label="Full Name"><Input value={d.full_name ?? ""} onChange={(v) => update("full_name", v)} /></Field>
        <Field label="Place"><Input value={d.place ?? ""} onChange={(v) => update("place", v)} /></Field>
      </Row>
      <Row>
        <Field label="Date"><Input value={d.date ?? ""} onChange={(v) => update("date", v)} placeholder="DD/MM/YYYY" /></Field>
        <Field label="Signature (text)"><Input value={d.signature ?? ""} onChange={(v) => update("signature", v)} placeholder="Your name in cursive" /></Field>
      </Row>
      {d.signature && (
        <p className="text-[10px] text-[#8b949e]">Signature will appear in cursive font on the CV.</p>
      )}
    </div>
  );
}

// ── Router ─────────────────────────────────────────────────────────────────────

const FORM_MAP: Record<string, React.ComponentType<FormProps>> = {
  personal_details: PersonalDetailsForm,
  profile_summary: ProfileSummaryForm,
  experience: ExperienceForm,
  education: EducationForm,
  skills: SkillsForm,
  languages: LanguagesForm,
  projects: ProjectsForm,
  courses: CoursesForm,
  certificates: CertificatesForm,
  awards: AwardsForm,
  interests: InterestsForm,
  publications: PublicationsForm,
  organizations: OrganizationsForm,
  references: ReferencesForm,
  declaration: DeclarationForm,
};

export function SectionForm({ section, onChange }: FormProps) {
  const FormComponent = FORM_MAP[section.section_type];
  if (!FormComponent) return <p className="text-[#8b949e] text-sm">Unknown section type</p>;
  return <FormComponent section={section} onChange={onChange} />;
}
