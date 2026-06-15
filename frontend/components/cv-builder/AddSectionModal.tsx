"use client";

import { X, Check, User, FileText, Briefcase, GraduationCap, Zap, Globe, Rocket, BookOpen, Award, Trophy, Heart, Book, Users, UserCheck, ClipboardList } from "lucide-react";
import type { SectionType } from "@/types";
import { SECTION_LABELS, REPEATABLE_SECTION_TYPES } from "@/types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  existingTypes: Set<SectionType>;
  onAdd: (type: SectionType) => void;
  onClose: () => void;
}

interface SectionMeta {
  icon: LucideIcon;
  description: string;
}

const SECTION_META: Record<SectionType, SectionMeta> = {
  personal_details: { icon: User, description: "Your name, contact info and links" },
  profile_summary:  { icon: FileText, description: "A short intro about yourself" },
  experience:       { icon: Briefcase, description: "Your work history and achievements" },
  education:        { icon: GraduationCap, description: "Degrees, diplomas and qualifications" },
  skills:           { icon: Zap, description: "Technical and soft skills with levels" },
  languages:        { icon: Globe, description: "Languages you speak" },
  projects:         { icon: Rocket, description: "Personal or professional projects" },
  courses:          { icon: BookOpen, description: "Training and online courses" },
  certificates:     { icon: Award, description: "Professional certifications" },
  awards:           { icon: Trophy, description: "Recognitions and achievements" },
  interests:        { icon: Heart, description: "Hobbies and personal interests" },
  publications:     { icon: Book, description: "Papers, articles, books" },
  organizations:    { icon: Users, description: "Volunteering and memberships" },
  references:       { icon: UserCheck, description: "Professional references" },
  declaration:      { icon: ClipboardList, description: "Formal declaration statement" },
};

const ALL_SECTIONS: SectionType[] = [
  "personal_details", "profile_summary", "experience", "education",
  "skills", "languages", "projects", "courses", "certificates",
  "awards", "interests", "publications", "organizations", "references", "declaration",
];

export function AddSectionModal({ existingTypes, onAdd, onClose }: Props) {
  const isRepeatable = (t: SectionType) => REPEATABLE_SECTION_TYPES.includes(t);
  const isAlwaysPresent = (t: SectionType) => t === "personal_details";

  const isDimmed = (t: SectionType) => isAlwaysPresent(t) || (!isRepeatable(t) && existingTypes.has(t));
  const isAdded = (t: SectionType) => existingTypes.has(t);
  const isClickable = (t: SectionType) => !isAlwaysPresent(t) && (isRepeatable(t) || !existingTypes.has(t));

  const handleClick = (type: SectionType) => {
    if (!isClickable(type)) return;
    onAdd(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#161b22] border border-[#30363d] rounded-xl w-[560px] max-h-[80vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] flex-shrink-0">
          <div>
            <h3 className="text-white font-semibold text-sm">Add a Section</h3>
            <p className="text-[#8b949e] text-[11px] mt-0.5">Choose a section to add to your CV</p>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-2">
            {ALL_SECTIONS.map((type) => {
              const meta = SECTION_META[type];
              const Icon = meta.icon;
              const dimmed = isDimmed(type);
              const added = isAdded(type);
              const clickable = isClickable(type);
              const repeatable = isRepeatable(type);

              return (
                <button
                  key={type}
                  onClick={() => handleClick(type)}
                  disabled={!clickable}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                    clickable
                      ? "border-[#30363d] hover:border-blue-500/60 hover:bg-blue-600/5 cursor-pointer"
                      : "border-[#21262d] opacity-50 cursor-not-allowed",
                    !clickable && added && "opacity-40"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5",
                    clickable ? "bg-blue-600/15 text-blue-400" : "bg-[#21262d] text-[#484f58]"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-xs font-semibold truncate",
                        clickable ? "text-[#e6edf3]" : "text-[#484f58]"
                      )}>
                        {SECTION_LABELS[type]}
                      </span>
                      {added && !repeatable && (
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                      )}
                      {repeatable && (
                        <span className="text-[9px] text-blue-400/70 bg-blue-600/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          repeatable
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-[10px] mt-0.5 leading-relaxed",
                      clickable ? "text-[#8b949e]" : "text-[#30363d]"
                    )}>
                      {meta.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
