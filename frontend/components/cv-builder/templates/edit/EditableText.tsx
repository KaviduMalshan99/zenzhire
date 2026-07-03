"use client";

import { useCallback, useRef } from "react";
import { useCVEdit } from "./CVEditContext";

interface Props {
  value: string;
  onCommit: (value: string) => void;
  as?: "span" | "div";
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
  /** Allow Enter to insert a newline instead of committing (blur to commit). */
  multiline?: boolean;
}

export function EditableText({
  value,
  onCommit,
  as = "span",
  style,
  className,
  placeholder,
  multiline = false,
}: Props) {
  const { editable } = useCVEdit();
  const ref = useRef<HTMLElement>(null);
  const Tag = as as any;

  const commit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = (el.textContent ?? "").trim();
    if (next !== value) onCommit(next);
  }, [value, onCommit]);

  if (!editable) {
    return (
      <Tag className={className} style={style}>
        {value || placeholder}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ outline: "none", ...style }}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={commit}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (ref.current) ref.current.textContent = value;
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {value}
    </Tag>
  );
}
