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

function PhotoUpload({ value, onChange }: { value: string; onChange: (b64: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Photo must be under 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative w-16 h-16 rounded-full border-2 border-dashed border-[#30363d] hover:border-blue-500 flex items-center justify-center overflow-hidden transition-colors bg-[#0d1117] flex-shrink-0"
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-5 h-5 text-[#8b949e]" />
        )}
      </button>
      <div className="flex flex-col gap-1">
        <button type="button" onClick={() => fileRef.current?.click()} className="text-[11px] text-blue-400 hover:text-blue-300">
          {value ? "Change photo" : "Upload photo"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-[11px] text-red-400 hover:text-red-300">
            Remove
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
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
    <div className="space-y-3">
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
        <Field label="Driving License"><Input value={d.driving_license ?? ""} onChange={(v) => update("driving_license", v)} /></Field>
      </Row>
      <div>
        <span className={labelCls}>Profile Photo</span>
        <PhotoUpload value={d.photo_base64 ?? ""} onChange={(b64) => update("photo_base64", b64)} />
        <p className="text-[9px] text-[#8b949e] mt-1.5">Hidden in Classic template (ATS-friendly). Max 2 MB · JPG, PNG or WebP.</p>
      </div>

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
                  <Field label="Employer URL"><Input value={entry.employer_link} onChange={(v) => updateEntry(entry.id, "employer_link", v)} placeholder="https://..." /></Field>
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

  const addEntry = () => onChange({ ...d, entries: [...entries, { id: newId(), degree: "", institution: "", institution_link: "", location: "", start_date: "", end_date: "", description: "" }] });
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
            <Field label="Degree" required><Input value={entry.degree} onChange={(v) => updateEntry(entry.id, "degree", v)} /></Field>
            <Field label="Institution" required><Input value={entry.institution} onChange={(v) => updateEntry(entry.id, "institution", v)} /></Field>
          </Row>
          <Row>
            <Field label="Institution URL"><Input value={entry.institution_link} onChange={(v) => updateEntry(entry.id, "institution_link", v)} placeholder="https://..." /></Field>
            <Field label="Location"><Input value={entry.location} onChange={(v) => updateEntry(entry.id, "location", v)} /></Field>
          </Row>
          <Row>
            <Field label="Start Date"><Input value={entry.start_date} onChange={(v) => updateEntry(entry.id, "start_date", v)} placeholder="Sep 2018" /></Field>
            <Field label="End Date"><Input value={entry.end_date} onChange={(v) => updateEntry(entry.id, "end_date", v)} placeholder="Jun 2022" /></Field>
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

const SKILL_LEVELS_TEXT = ["Beginner", "Intermediate", "Advanced"];
const SKILL_LEVELS_NUM = ["1", "2", "3", "4", "5"];

function SkillsForm({ section, onChange }: FormProps) {
  const d = section.data;
  const entries: any[] = d.entries ?? [];
  const style: "text" | "numbers" = d.display_style ?? "text";
  const levels = style === "numbers" ? SKILL_LEVELS_NUM : SKILL_LEVELS_TEXT;

  const addEntry = () => onChange({ ...d, entries: [...entries, { id: newId(), skill_name: "", level: levels[1], subskills: "" }] });
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
                value={entry.level}
                onChange={(e) => updateEntry(entry.id, "level", e.target.value)}
                className={cn(inputCls, "w-24 flex-shrink-0")}
              >
                {levels.map((l) => <option key={l}>{l}</option>)}
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
          <Field label="Link (GitHub / Demo)"><Input value={entry.link} onChange={(v) => updateEntry(entry.id, "link", v)} placeholder="https://..." /></Field>
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
            <Field label="Link"><Input value={e.link} onChange={(v) => upd(e.id, "link", v)} placeholder="https://..." /></Field>
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
            <Field label="Credential URL"><Input value={e.link} onChange={(v) => upd(e.id, "link", v)} placeholder="https://..." /></Field>
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
