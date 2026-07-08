"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// First 6 templates in the real gallery's own order (app/(dashboard)/templates/page.tsx) —
// this is a preview of that order, not a curated pick, so free-tier templates naturally lead.
const SHOWCASE_TEMPLATES = [
  { id: "classic", name: "Classic" },
  { id: "academic", name: "Inline" },
  { id: "minimal", name: "Colorful" },
  { id: "modern", name: "Modern" },
  { id: "tech", name: "Bordered" },
  { id: "creative", name: "Timeline" },
];

// Fixed pixel width — deliberately not a fluid CSS-grid column. The iframe below is scaled by a
// single hardcoded factor (340/794); if the outer box's rendered width ever drifted from 340, the
// mismatch between the iframe's fixed pixel size and its actual container would both eat the
// visual gap AND clip the bottom of the page via overflow:hidden.
const THUMB_WIDTH = 340;

function TemplateThumb({ id, name }: { id: string; name: string }) {
  return (
    <Link
      href="/templates"
      draggable={false}
      className="group flex-shrink-0 snap-start"
      style={{ width: THUMB_WIDTH }}
    >
      <div className="relative overflow-hidden rounded-lg border border-[#30363d] bg-white group-hover:border-blue-500/60 transition-colors duration-200 shadow-lg shadow-black/20">
        <div style={{ position: "relative", width: "100%", paddingTop: "141.4%" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }}>
            <iframe
              src={`/cv-template-preview/${id}`}
              style={{
                width: "794px",
                height: "1122px",
                border: "none",
                transformOrigin: "top left",
                transform: `scale(${THUMB_WIDTH / 794})`,
                pointerEvents: "none",
              }}
              tabIndex={-1}
              title={`${name} template preview`}
            />
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-sm text-[#8b949e] group-hover:text-white transition-colors text-center">
        {name}
      </p>
    </Link>
  );
}

export function TemplateCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const dragDistance = useRef(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragging.current = true;
    dragDistance.current = 0;
    dragStartX.current = e.clientX;
    scrollStartX.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const delta = e.clientX - dragStartX.current;
    dragDistance.current = Math.max(dragDistance.current, Math.abs(delta));
    el.scrollLeft = scrollStartX.current - delta;
  };

  const endDrag = () => {
    dragging.current = false;
  };

  // Suppress the Link's click navigation only when the pointer interaction was an actual drag.
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Let a plain mouse wheel (mostly vertical delta) drive horizontal scroll; trackpads already
  // send native horizontal delta for two-finger swipes, so this only kicks in for real wheels.
  const onWheel = (e: React.WheelEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  // A translucent overlay div doesn't work here: alpha-blending a dark gradient over the
  // template cards' stark-white paper background composites into a muddy gray smear rather than
  // a clean fade, no matter how it's tuned. Masking the scroller's own content to transparent
  // avoids that entirely — the card pixels genuinely fade to nothing, cleanly revealing the
  // page's real background underneath instead of a color blend sitting on top of it. The fade is
  // only applied on whichever side still has more to scroll (same canLeft/canRight tracked above),
  // so it never crops content at the true start/end of the row.
  const FADE = 32;
  const maskImage = `linear-gradient(to right, transparent, black ${canLeft ? `${FADE}px` : "0px"}, black ${
    canRight ? `calc(100% - ${FADE}px)` : "100%"
  }, transparent)`;

  return (
    <div
      ref={scrollerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
      onWheel={onWheel}
      className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-proximity scroll-smooth cursor-grab active:cursor-grabbing select-none [-ms-overflow-style:none] [scrollbar-width:thin]"
      style={{ maskImage, WebkitMaskImage: maskImage }}
    >
      {SHOWCASE_TEMPLATES.map((t) => (
        <TemplateThumb key={t.id} id={t.id} name={t.name} />
      ))}
    </div>
  );
}
