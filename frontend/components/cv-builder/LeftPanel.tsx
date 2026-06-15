"use client";

import { useState } from "react";
import {
  GripVertical, Eye, EyeOff, ChevronLeft, Plus, Trash2, Check,
  FileText, Layers,
} from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CVDocument, CVSection, SectionType, TemplateId, SaveStatus } from "@/types";
import { SECTION_LABELS, REPEATABLE_SECTION_TYPES } from "@/types";
import { SectionForm } from "./SectionForms";
import { AddSectionModal } from "./AddSectionModal";
import { cn } from "@/lib/utils";

const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
  { id: "executive", label: "Executive" },
  { id: "tech", label: "Tech" },
  { id: "creative", label: "Creative" },
  { id: "academic", label: "Academic" },
  { id: "gcc", label: "GCC" },
];

interface Props {
  cv: CVDocument;
  sections: CVSection[];
  activeSection: CVSection | null;
  saveStatus: SaveStatus;
  onSelectSection: (s: CVSection) => void;
  onToggleVisibility: (s: CVSection) => void;
  onReorder: (sections: CVSection[]) => void;
  onAddSection: (type: SectionType) => void;
  onDeleteSection: (s: CVSection) => void;
  onUpdateCV: (updates: { title?: string; template_id?: TemplateId }) => void;
  onSectionDataChange: (section: CVSection, data: Record<string, any>) => void;
  /** When true, renders without fixed width (for mobile sheet embedding) */
  mobile?: boolean;
}

function SortableSectionItem({
  section, isActive, onSelect, onToggleVisibility, onDelete,
}: {
  section: CVSection;
  isActive: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1.5 px-2 py-2 rounded-md cursor-pointer group transition-colors text-sm",
        isActive
          ? "bg-blue-600/15 text-blue-400"
          : "text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
      )}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-[#30363d] hover:text-[#8b949e] cursor-grab active:cursor-grabbing p-0.5 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <span className="flex-1 truncate text-xs font-medium">
        {SECTION_LABELS[section.section_type]}
      </span>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="p-1 rounded hover:bg-[#30363d]"
          title={section.is_visible ? "Hide section" : "Show section"}
        >
          {section.is_visible
            ? <Eye className="w-3 h-3" />
            : <EyeOff className="w-3 h-3 text-[#30363d]" />}
        </button>
        {section.section_type !== "personal_details" && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded hover:bg-red-900/30 hover:text-red-400"
            title="Remove section"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export function LeftPanel({
  cv, sections, activeSection, saveStatus,
  onSelectSection, onToggleVisibility, onReorder, onAddSection,
  onDeleteSection, onUpdateCV, onSectionDataChange, mobile,
}: Props) {
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(cv.title);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const handleSectionClick = (section: CVSection) => {
    onSelectSection(section);
    setMode("form");
  };

  const existingTypes = new Set(sections.map((s) => s.section_type));

  const saveIndicator = saveStatus === "saving"
    ? <span className="text-[10px] text-[#8b949e]">Saving...</span>
    : saveStatus === "saved"
    ? <span className="text-[10px] text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />Saved</span>
    : null;

  return (
    <div className={cn(
      "bg-[#161b22] flex flex-col overflow-hidden",
      mobile ? "flex-1" : "w-96 flex-shrink-0 border-r border-[#30363d]"
    )}>
      {mode === "form" && activeSection ? (
        /* ── Form mode ─────────────────────────────────────────────────────── */
        <>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d] flex-shrink-0">
            <button
              onClick={() => setMode("list")}
              className="text-[#8b949e] hover:text-white transition-colors p-1 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white text-sm font-semibold truncate flex-1">
              {SECTION_LABELS[activeSection.section_type]}
            </span>
            {saveIndicator}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <SectionForm
              key={activeSection.id}
              section={activeSection}
              onChange={(data) => onSectionDataChange(activeSection, data)}
            />
          </div>
        </>
      ) : (
        /* ── List mode ─────────────────────────────────────────────────────── */
        <>
          {/* Title */}
          <div className="px-4 pt-4 pb-3 border-b border-[#30363d] flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
              {editingTitle ? (
                <input
                  autoFocus
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={() => {
                    setEditingTitle(false);
                    if (titleValue.trim() && titleValue !== cv.title) {
                      onUpdateCV({ title: titleValue.trim() });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setEditingTitle(false);
                      if (titleValue.trim() && titleValue !== cv.title) {
                        onUpdateCV({ title: titleValue.trim() });
                      }
                    }
                    if (e.key === "Escape") {
                      setEditingTitle(false);
                      setTitleValue(cv.title);
                    }
                  }}
                  className="flex-1 bg-transparent text-white text-sm font-semibold outline-none border-b border-blue-500 pb-0.5"
                />
              ) : (
                <span
                  className="flex-1 text-white text-sm font-semibold cursor-pointer hover:text-blue-300 transition-colors truncate"
                  onClick={() => setEditingTitle(true)}
                  title="Click to rename"
                >
                  {cv.title}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8b949e] text-[11px]">Click title to rename</span>
              {saveIndicator}
            </div>
          </div>

          {/* Template selector */}
          <div className="px-4 py-3 border-b border-[#30363d] flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3.5 h-3.5 text-[#8b949e]" />
              <span className="text-[#8b949e] text-[11px] uppercase tracking-wide font-medium">Template</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {TEMPLATE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateCV({ template_id: t.id })}
                  className={cn(
                    "text-[10px] py-1.5 px-1 rounded border transition-colors text-center truncate",
                    cv.template_id === t.id
                      ? "border-blue-500 bg-blue-600/10 text-blue-400"
                      : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-[#e6edf3]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections list */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    isActive={activeSection?.id === section.id}
                    onSelect={() => handleSectionClick(section)}
                    onToggleVisibility={() => onToggleVisibility(section)}
                    onDelete={() => onDeleteSection(section)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Add section button */}
          <div className="px-4 py-3 border-t border-[#30363d] flex-shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-dashed border-[#30363d] text-[#8b949e] hover:border-blue-500/50 hover:text-blue-400 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
        </>
      )}

      {showAddModal && (
        <AddSectionModal
          existingTypes={existingTypes}
          onAdd={(type) => { onAddSection(type); setShowAddModal(false); }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
