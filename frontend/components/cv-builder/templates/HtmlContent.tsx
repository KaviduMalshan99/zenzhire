"use client";
import React from "react";
import DOMPurify from "dompurify";

interface Props {
  html: string;
  style?: React.CSSProperties;
  className?: string;
}

export function HtmlContent({ html, style, className }: Props) {
  if (!html || html === "<p></p>" || html.trim() === "") return null;
  return (
    <div
      className={`cv-html-content${className ? ` ${className}` : ""}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
