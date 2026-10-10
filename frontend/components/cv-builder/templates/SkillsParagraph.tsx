"use client";

import React from "react";
import { EditableHtml } from "./edit/EditableHtml";

/** A skills section stores either individual `entries` or one free-text
 *  `skills_paragraph` (rich HTML, exactly the shape profile_summary's
 *  `summary` already uses). `skills_mode` records which one the user picked,
 *  so BOTH datasets survive the toggle — switching modes never deletes the
 *  other one, it only changes which is rendered. */
export const SKILLS_MODE_PARAGRAPH = "paragraph";
export const SKILLS_MODE_ENTRIES = "entries";

export function isEmptySkillsHtml(html?: string): boolean {
  return !html || html === "<p></p>" || html.replace(/<[^>]*>/g, "").trim() === "";
}

/**
 * Returns the paragraph HTML when this skills section should render as free
 * text, or null when it should render its individual entries instead.
 *
 * `skills_mode === "paragraph"` is the explicit signal the editor's toggle
 * writes, and it wins even when entries also exist — a user who switches to
 * Paragraph mode while already having a skills list still gets the paragraph
 * on the page, and their entries stay in the data, untouched, for whenever
 * they switch back. Sections saved before this feature existed have no
 * `skills_mode` at all, so they fall back to the conservative rule: paragraph
 * only when there are no entries that would otherwise be hidden.
 */
export function getSkillsParagraph(data: any): string | null {
  const html = data?.skills_paragraph;
  if (isEmptySkillsHtml(html)) return null;
  if (data?.skills_mode === SKILLS_MODE_PARAGRAPH) return html as string;
  if (!data?.skills_mode && (data?.entries?.length ?? 0) === 0) return html as string;
  return null;
}

interface Props {
  html: string;
  onCommit: (html: string) => void;
  style?: React.CSSProperties;
}

/**
 * Renders the free-text skills body. Delegates to EditableHtml, which is the
 * same DOMPurify-backed path every other rich-text field in a template uses
 * (and which falls straight through to HtmlContent when the preview isn't
 * editable) — no new sanitization anywhere.
 *
 * Deliberately NOT marked `.cv-entry`: the PDF pipeline treats a `.cv-entry`
 * as an unbreakable chunk, and a long free-text paragraph has to stay
 * splittable across pages. Only its own <p>/<li> children are atomic, via
 * `.cv-skills-paragraph` in globals.css — the same rule the cover letter's
 * Tiptap body (`.cl-html-body`) already uses for exactly this reason.
 */
export function SkillsParagraph({ html, onCommit, style }: Props) {
  return (
    <EditableHtml
      html={html}
      onCommit={onCommit}
      className="cv-skills-paragraph"
      style={style}
    />
  );
}
