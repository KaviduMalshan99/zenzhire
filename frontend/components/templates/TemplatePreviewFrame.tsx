"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// The single correct way to render a live CV template preview: locked to the real A4
// aspect ratio (794x1122) so the full page is always visible, never cropped, and scaled
// to whatever width the container ends up at. Used by both the public template gallery
// and the home page hero mockup so they can never drift into two different (and
// differently broken) cropping behaviors.
//
// The load listener is attached imperatively via a ref rather than a JSX `onLoad` prop —
// React's synthetic event system never invokes onLoad for <iframe> (verified empirically),
// so the scale-on-load logic below would silently never run and every preview would sit on
// its loading spinner forever. It's attached in useLayoutEffect (not useEffect) so it's in
// place before the browser can dispatch that event — but on the very first mount the SSR'd
// HTML already contains the iframe's `src`, so the browser can start (and on a fast local
// response, finish) loading it while still parsing the page, before React has even
// hydrated. So the effect also checks contentDocument.readyState directly: if the iframe is
// already done by the time we attach, the "load" event has already fired and will never
// fire again, and we have to treat "already complete" as the load signal ourselves.
export function TemplatePreviewFrame({
  templateId,
  accentColor,
  photoSize,
  className,
}: {
  templateId: string;
  accentColor: string;
  photoSize?: number;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const params = new URLSearchParams({ accentColor });
  if (photoSize) params.set("photoSize", String(photoSize));
  const src = `/cv-template-preview/${templateId}?${params.toString()}`;

  useLayoutEffect(() => {
    setLoaded(false);
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const container = iframe.parentElement?.parentElement;
      if (container) {
        const scale = container.offsetWidth / 794;
        iframe.style.transform = `scale(${scale})`;
      }
      setLoaded(true);
    };

    // Same-origin (it's our own /cv-template-preview route), so contentDocument is
    // always accessible here — no need to guard against a cross-origin throw.
    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
      return;
    }

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [src]);

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden", background: "white", width: "100%", aspectRatio: "794 / 1122" }}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-[#f8fafc] flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-[#d1d5db] animate-spin" />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <iframe
          ref={iframeRef}
          src={src}
          style={{
            width: "794px",
            height: "1122px",
            border: "none",
            transformOrigin: "top left",
            pointerEvents: "none",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
          tabIndex={-1}
          title={`${templateId} template preview`}
        />
      </div>
    </div>
  );
}
