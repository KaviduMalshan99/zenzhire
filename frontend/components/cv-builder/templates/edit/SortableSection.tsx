"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CVSection } from "@/types";
import { useCVEdit } from "./CVEditContext";

interface Props {
  section: CVSection;
  defaultMarginBottom: number;
  defaultLineHeight?: number;
  children: React.ReactNode;
}

/**
 * Every A4 page-card re-renders the full template (pagination works via
 * clipping/masking, not by slicing the section list) — so this component
 * must only be mounted for the one page-card where this section is visually
 * authoritative (see `isDragTarget` in CVEditContext, computed in
 * CentrePanel from where each section actually lands on the page). That
 * keeps `useSortable` from registering the same section id more than once
 * with dnd-kit at the same time, while still letting every section be
 * dragged from — and dropped onto — any page. See SortableSection below.
 */
function SortableSectionInner({ section, children }: Props) {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
    outline: hovered || isDragging ? "1px dashed #60a5fa" : "1px dashed transparent",
    outlineOffset: 3,
  };

  return (
    <div
      ref={setNodeRef}
      data-section-id={section.id}
      style={wrapperStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div
          contentEditable={false}
          className="flex items-center gap-2 bg-[#111827] rounded px-1.5 py-1 shadow-lg"
          style={{ position: "absolute", top: -14, right: 0, zIndex: 30 }}
        >
          <button
            type="button"
            {...attributes}
            {...listeners}
            title="Drag to reorder"
            className="text-[#e5e7eb] hover:text-white cursor-grab active:cursor-grabbing flex items-center"
          >
            <GripVertical size={12} />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

export function SortableSection(props: Props) {
  const { editable, isDragTarget } = useCVEdit();
  if (editable && isDragTarget(props.section.id)) {
    return <SortableSectionInner {...props} />;
  }
  // Not the drag-authoritative copy of this section (or not in an editable
  // context at all, e.g. the print page) — still tag it with the section id
  // so CentrePanel's measurement pass can find every copy on every page-card,
  // but skip useSortable/the drag toolbar entirely.
  return <div data-section-id={props.section.id}>{props.children}</div>;
}
