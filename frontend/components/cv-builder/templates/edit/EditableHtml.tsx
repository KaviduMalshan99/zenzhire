"use client";

import { useCallback, useRef } from "react";
import DOMPurify from "dompurify";
import { useCVEdit } from "./CVEditContext";
import { HtmlContent } from "../HtmlContent";

interface Props {
  html: string;
  onCommit: (html: string) => void;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
}

function isEmptyHtml(html: string) {
  return !html || html === "<p></p>" || html.replace(/<[^>]*>/g, "").trim() === "";
}

export function EditableHtml({ html, onCommit, style, className, placeholder }: Props) {
  const { editable } = useCVEdit();
  const ref = useRef<HTMLDivElement>(null);

  const commit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const raw = el.innerHTML;
    const next = isEmptyHtml(raw) ? "" : DOMPurify.sanitize(raw);
    if (next !== (html ?? "")) onCommit(next);
  }, [html, onCommit]);

  if (!editable) {
    return <HtmlContent html={html} style={style} className={className} />;
  }

  const sanitized = isEmptyHtml(html) ? "" : DOMPurify.sanitize(html);

  return (
    <div
      ref={ref}
      className={`cv-html-content${className ? ` ${className}` : ""}`}
      style={{ outline: "none", minHeight: "1em", ...style }}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          if (ref.current) ref.current.innerHTML = sanitized;
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    />
  );
}
