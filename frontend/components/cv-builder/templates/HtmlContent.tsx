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
  // DOMPurify has no server-side (Node/SSR) DOM to sanitize against, so its
  // sanitize method isn't available during the initial server render of this
  // client component. Strip tags outright there rather than passing raw
  // markup through — the client render after hydration always sanitizes.
  const clean = typeof window === "undefined" ? html.replace(/<[^>]*>/g, "") : DOMPurify.sanitize(html);
  return (
    <div
      className={`cv-html-content${className ? ` ${className}` : ""}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
