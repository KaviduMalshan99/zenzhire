"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import type { CareerMentorField } from "@/lib/api";
import { cn } from "@/lib/utils";
import { focusRing } from "./QuickStartShell";

const inputClass =
  "w-full min-h-[48px] rounded-xl bg-[#0d1117] border border-[#30363d] px-4 text-base text-[#e6edf3] placeholder:text-[#6e7681] transition-colors focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/40";

const labelClass = "block text-sm font-medium text-[#c9d1d9] mb-1.5";

// ── Free text ────────────────────────────────────────────────────────────────

export function TextAnswer({
  label,
  value,
  onChange,
  onEnter,
  multiline,
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={cn(inputClass, "py-3 resize-none leading-relaxed")}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter?.();
            }
          }}
          enterKeyHint="next"
          className={inputClass}
        />
      )}
    </div>
  );
}

export function SuggestionChips({
  label,
  options,
  isSelected,
  onPick,
}: {
  label: string;
  options: string[];
  isSelected: (option: string) => boolean;
  onPick: (option: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = isSelected(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(option)}
            className={cn(
              "min-h-[44px] px-4 rounded-full border text-sm transition-colors inline-flex items-center gap-1.5",
              selected
                ? "border-[#2563eb] bg-[#2563eb]/15 text-white"
                : "border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]",
              focusRing,
            )}
          >
            {selected && <Check className="w-3.5 h-3.5 text-blue-300" aria-hidden="true" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

// ── Single choice (career_stage, has_experience) ──────────────────────────────

export function ChoiceCards({
  label,
  options,
  value,
  onChange,
  layout = "list",
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  layout?: "list" | "pair";
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.value === value);

  // Radio-group keyboard pattern: arrows move (and select), only one stop in the tab order.
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className={cn(layout === "pair" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-2.5")}>
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex === -1 && i === 0) ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "w-full rounded-xl border-2 text-left transition-colors flex items-center justify-between gap-3",
              layout === "pair" ? "min-h-[96px] px-4 py-4 text-lg font-semibold" : "min-h-[56px] px-4 py-3 text-base",
              selected
                ? "border-[#2563eb] bg-[#2563eb]/15 text-white"
                : "border-[#30363d] text-[#e6edf3] hover:border-[#8b949e]",
              focusRing,
            )}
          >
            <span>{option.label}</span>
            <span
              aria-hidden="true"
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2",
                selected ? "bg-[#2563eb] border-[#2563eb]" : "border-[#484f58]",
              )}
            >
              {selected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Toggle (I still work here / I'm still studying) ───────────────────────────

export function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 min-h-[48px] cursor-pointer select-none">
      <span className="text-[15px] text-[#e6edf3]">{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "relative w-12 h-7 rounded-full transition-colors flex-shrink-0",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0d1117]",
          checked ? "bg-[#2563eb]" : "bg-[#30363d]",
        )}
      >
        <span className={cn("absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform", checked && "translate-x-5")} />
      </span>
    </label>
  );
}

// ── Multi-field steps (exp_role, education, edu_year, contact) ───────────────

export type FieldValues = Record<string, string | boolean>;

const FIELD_INPUT_PROPS: Record<string, React.InputHTMLAttributes<HTMLInputElement>> = {
  phone: { type: "tel", autoComplete: "tel", inputMode: "tel" },
  city: { autoComplete: "address-level2" },
  year: { inputMode: "numeric", maxLength: 4, placeholder: "e.g. 2024" },
  job_title: { autoComplete: "organization-title" },
  company: { autoComplete: "organization" },
};

export function isFieldRequired(field: CareerMentorField, values: FieldValues): boolean {
  return field.required && !(field.required_unless && values[field.required_unless]);
}

export function FieldsAnswer({
  fields,
  values,
  onChange,
  onEnter,
}: {
  fields: CareerMentorField[];
  values: FieldValues;
  onChange: (v: FieldValues) => void;
  onEnter?: () => void;
}) {
  const baseId = useId();
  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => {
        if (field.type === "checkbox") {
          return (
            <ToggleRow
              key={field.name}
              label={field.label}
              checked={Boolean(values[field.name])}
              onChange={(checked) => onChange({ ...values, [field.name]: checked })}
            />
          );
        }
        const id = `${baseId}-${field.name}`;
        const required = isFieldRequired(field, values);
        return (
          <div key={field.name}>
            <label htmlFor={id} className={labelClass}>
              {field.label}
              {!required && <span className="text-[#8b949e] font-normal"> (optional)</span>}
            </label>
            <input
              id={id}
              type="text"
              value={String(values[field.name] ?? "")}
              maxLength={200}
              onChange={(e) => onChange({ ...values, [field.name]: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnter?.();
                }
              }}
              className={inputClass}
              {...FIELD_INPUT_PROPS[field.name]}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Dates (exp_dates): month + year pickers and "I still work here" ──────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Stored the way the builder's own date fields read ("Jan 2022", or just "2022").
function parseMonthYear(value: string): { month: string; year: string } {
  const m = value.trim().match(/^(?:([A-Za-z]{3})[a-z]*\.?\s+)?(\d{4})$/);
  if (!m) return { month: "", year: "" };
  const month = MONTHS.find((x) => x.toLowerCase() === (m[1] ?? "").toLowerCase()) ?? "";
  return { month, year: m[2] };
}

function MonthYearField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  // Local state, because a month picked before the year can't be stored in `value` yet.
  const [{ month, year }, setParts] = useState(() => parseMonthYear(value));
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 51 }, (_, i) => String(thisYear - i));
  const emit = (m: string, y: string) => {
    setParts({ month: m, year: y });
    onChange(y ? (m ? `${m} ${y}` : y) : "");
  };
  const selectClass = cn(inputClass, "appearance-none pr-10");

  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-m`} className="sr-only">
            {label} month
          </label>
          <div className="relative">
          <select id={`${id}-m`} value={month} onChange={(e) => emit(e.target.value, year)} className={selectClass}>
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={m}>
                {MONTH_NAMES[i]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" aria-hidden="true" />
          </div>
        </div>
        <div>
          <label htmlFor={`${id}-y`} className="sr-only">
            {label} year
          </label>
          <div className="relative">
          <select id={`${id}-y`} value={year} onChange={(e) => emit(month, e.target.value)} className={selectClass}>
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </fieldset>
  );
}

export function DatesAnswer({ values, onChange }: { values: FieldValues; onChange: (v: FieldValues) => void }) {
  const current = Boolean(values.current);
  return (
    <div className="flex flex-col gap-4">
      <MonthYearField
        label="Start date"
        value={String(values.start_date ?? "")}
        onChange={(v) => onChange({ ...values, start_date: v })}
      />
      <ToggleRow label="I still work here" checked={current} onChange={(checked) => onChange({ ...values, current: checked })} />
      {!current && (
        <MonthYearField
          label="End date"
          value={String(values.end_date ?? "")}
          onChange={(v) => onChange({ ...values, end_date: v })}
        />
      )}
    </div>
  );
}

// ── Skills (list) ─────────────────────────────────────────────────────────────

export function SkillsAnswer({
  suggestions,
  value,
  onChange,
}: {
  suggestions: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const has = (skill: string) => value.some((v) => v.toLowerCase() === skill.toLowerCase());

  const toggle = (skill: string) =>
    onChange(has(skill) ? value.filter((v) => v.toLowerCase() !== skill.toLowerCase()) : [...value, skill]);

  const addDraft = () => {
    const added = draft
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !has(s));
    if (added.length) onChange([...value, ...added]);
    setDraft("");
  };

  const custom = value.filter((v) => !suggestions.some((s) => s.toLowerCase() === v.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <SuggestionChips label="Suggested skills" options={suggestions} isSelected={has} onPick={toggle} />

      <div>
        <label htmlFor={id} className={labelClass}>
          Add your own
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            type="text"
            value={draft}
            maxLength={60}
            placeholder="e.g. Photoshop"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addDraft();
              }
            }}
            enterKeyHint="done"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addDraft}
            disabled={!draft.trim()}
            className={cn(
              "min-h-[48px] px-4 rounded-xl border border-[#30363d] text-[#e6edf3] text-sm font-medium inline-flex items-center gap-1.5 hover:border-[#8b949e] disabled:opacity-40",
              focusRing,
            )}
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Add
          </button>
        </div>
      </div>

      {custom.length > 0 && (
        <ul aria-label="Your skills" className="flex flex-wrap gap-2">
          {custom.map((skill) => (
            <li key={skill}>
              <span className="min-h-[44px] pl-4 rounded-full border border-[#2563eb] bg-[#2563eb]/15 text-white text-sm inline-flex items-center gap-1">
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => toggle(skill)}
                  className={cn("w-11 h-11 rounded-full inline-flex items-center justify-center text-blue-200 hover:bg-white/10", focusRing)}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
