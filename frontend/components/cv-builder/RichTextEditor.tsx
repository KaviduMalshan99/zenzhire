"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, AlignLeft, AlignCenter, AlignJustify, Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync when value changes from outside (e.g. different entry selected) but editor isn't focused
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    cn(
      "p-1 rounded transition-colors flex items-center justify-center",
      active
        ? "bg-[#21262d] text-white"
        : "text-[#8b949e] hover:text-white hover:bg-[#21262d]"
    );

  const handleLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-[#30363d] rounded-md overflow-hidden focus-within:border-blue-500 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-[#30363d] bg-[#161b22] flex-wrap">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={cn(btn(editor.isActive("bold")), "font-bold text-[11px] w-5 h-5")}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn(btn(editor.isActive("italic")), "italic text-[11px] w-5 h-5")}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={cn(btn(editor.isActive("underline")), "underline text-[11px] w-5 h-5")}>U</button>
        <span className="w-px h-4 bg-[#30363d] mx-0.5" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn(btn(editor.isActive("bulletList")), "w-5 h-5")} title="Bullet list">
          <List className="w-3 h-3" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn(btn(editor.isActive("orderedList")), "w-5 h-5")} title="Numbered list">
          <ListOrdered className="w-3 h-3" />
        </button>
        <span className="w-px h-4 bg-[#30363d] mx-0.5" />
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={cn(btn(editor.isActive({ textAlign: "left" })), "w-5 h-5")} title="Align left">
          <AlignLeft className="w-3 h-3" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={cn(btn(editor.isActive({ textAlign: "center" })), "w-5 h-5")} title="Align center">
          <AlignCenter className="w-3 h-3" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={cn(btn(editor.isActive({ textAlign: "justify" })), "w-5 h-5")} title="Justify">
          <AlignJustify className="w-3 h-3" />
        </button>
        <span className="w-px h-4 bg-[#30363d] mx-0.5" />
        <button type="button" onClick={handleLink} className={cn(btn(editor.isActive("link")), "w-5 h-5")} title="Link">
          <LinkIcon className="w-3 h-3" />
        </button>
      </div>
      {/* Content area */}
      <div className="bg-[#0d1117]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
