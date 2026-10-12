"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Download, Loader2, PartyPopper, Pencil, Target } from "lucide-react";
import api from "@/lib/api";
import type { CVCustomization, CVDocument, TemplateId } from "@/types";
import { mergeCustomization } from "@/types";
import { CentrePanel } from "@/components/cv-builder/CentrePanel";
import { DownloadSuccessDialog } from "@/components/shared/DownloadSuccessDialog";
import { exportCvPdf } from "@/lib/pdf-export";
import { extractCVText } from "@/lib/cv-text";
import { FREE_TEMPLATES, apiErrorMessage, clearQuickStart, templatePickerCustomization } from "@/lib/quickstart";
import { cn } from "@/lib/utils";
import { QuickStartShell, focusRing, primaryButton, secondaryButton } from "./QuickStartShell";

const A4_W = 794;
const A4_H = 1123;
const PREVIEW_PADDING = 24; // CentrePanel's own padding around the pages

export function ReadyScreen({ cvId }: { cvId: number }) {
  const router = useRouter();
  const [cv, setCv] = useState<CVDocument | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [switching, setSwitching] = useState<TemplateId | null>(null);
  const [exporting, setExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [width, setWidth] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<CVDocument>(`/cv/${cvId}`)
      .then((res) => setCv(res.data))
      .catch(() => setLoadError(true));
  }, [cvId]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    // Preview only: links inside the scaled-down CV are too small to tap or focus.
    // (Set directly — React 18 doesn't pass `inert` through.)
    el.setAttribute("inert", "");
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, [cv]);

  const sections = cv ? [...cv.sections].sort((a, b) => a.display_order - b.display_order) : [];
  const customization: CVCustomization | null = cv
    ? mergeCustomization(cv.customization as Partial<CVCustomization> | null, cv.template_id)
    : null;
  const scale = width ? (width - PREVIEW_PADDING * 2) / A4_W : 0;

  const switchTemplate = async (templateId: TemplateId) => {
    if (!cv || cv.template_id === templateId || switching) return;
    setSwitching(templateId);
    try {
      const res = await api.put<CVDocument>(`/cv/${cv.id}`, {
        template_id: templateId,
        customization: templatePickerCustomization(templateId),
      });
      setCv(res.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't change the template. Please try again."));
    } finally {
      setSwitching(null);
    }
  };

  const download = async () => {
    if (!cv) return;
    setExporting(true);
    try {
      await exportCvPdf(cv, sections);
      setDownloaded(true);
    } catch (e) {
      console.error("PDF export error:", e);
      toast.error("Couldn't create the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const leave = (href: string) => {
    clearQuickStart();
    router.push(href);
  };

  const checkAts = () => {
    if (!cv) return;
    sessionStorage.setItem("ats_cv_text", extractCVText(sections));
    sessionStorage.setItem("ats_cv_id", String(cv.id));
    leave("/ats-checker?from_cv=1");
  };

  return (
    <QuickStartShell
      footer={
        <div className="flex flex-col gap-2.5">
          <button type="button" onClick={download} disabled={!cv || exporting} className={primaryButton}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
            Download PDF
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => leave(`/cv-builder/${cvId}`)} className={secondaryButton}>
              <Pencil className="w-4 h-4" aria-hidden="true" /> Edit details
            </button>
            <button type="button" onClick={checkAts} disabled={!cv} className={secondaryButton}>
              <Target className="w-4 h-4" aria-hidden="true" /> Check ATS score
            </button>
          </div>
        </div>
      }
      mainClassName="pt-6 pb-5"
    >
      <div className="flex items-center gap-2">
        <PartyPopper className="w-6 h-6 text-blue-300" aria-hidden="true" />
        <h1 className="text-white text-2xl font-bold">Your CV is ready</h1>
      </div>
      <p className="text-[#8b949e] text-[15px] mt-1.5">Have a look, pick a style, then download it or keep editing.</p>

      {loadError ? (
        <p role="alert" className="mt-6 text-sm text-red-400">
          Couldn&apos;t load the preview. Your CV is saved — use Edit details to open it.
        </p>
      ) : (
        <div
          ref={previewRef}
          className="mt-5 rounded-xl overflow-hidden border border-[#30363d] flex flex-col bg-[#94a3b8]"
          style={{ height: scale ? A4_H * scale + PREVIEW_PADDING * 2 : 320 }}
          aria-label="CV preview"
          role="img"
        >
          {cv && customization && scale > 0 ? (
            <CentrePanel
              cv={cv}
              sections={sections}
              zoom={scale * 100}
              customization={customization}
              onZoomChange={() => {}}
              showToolbar={false}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" aria-hidden="true" />
            </div>
          )}
        </div>
      )}

      <h2 className="text-white text-base font-semibold mt-6" id="qs-template-label">
        Style
      </h2>
      <div role="radiogroup" aria-labelledby="qs-template-label" className="mt-2.5 -mx-5 px-5 sm:-mx-6 sm:px-6 flex gap-2 overflow-x-auto pb-1">
        {FREE_TEMPLATES.map((t) => {
          const selected = cv?.template_id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!cv || !!switching}
              onClick={() => switchTemplate(t.id)}
              className={cn(
                "min-h-[44px] px-4 rounded-full border text-sm whitespace-nowrap inline-flex items-center gap-1.5 transition-colors flex-shrink-0 disabled:cursor-wait",
                selected ? "border-[#2563eb] bg-[#2563eb]/15 text-white" : "border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]",
                focusRing,
              )}
            >
              {switching === t.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                selected && <Check className="w-3.5 h-3.5 text-blue-300" aria-hidden="true" />
              )}
              {t.name}
            </button>
          );
        })}
      </div>

      <DownloadSuccessDialog open={downloaded} onClose={() => setDownloaded(false)} />
    </QuickStartShell>
  );
}
