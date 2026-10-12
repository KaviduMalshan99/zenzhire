"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { careerMentorApi, type CareerMentorAnswer, type CareerMentorStep } from "@/lib/api";
import {
  ROLE_SUGGESTIONS,
  apiErrorMessage,
  clearQuickStart,
  createBuilderCv,
  getAck,
  loadQuickStart,
  saveQuickStart,
  skillSuggestions,
} from "@/lib/quickstart";
import { cn } from "@/lib/utils";
import { QuickStartShell, ZeniAvatar, focusRing, primaryButton } from "@/components/quickstart/QuickStartShell";
import {
  ChoiceCards,
  DatesAnswer,
  FieldsAnswer,
  SkillsAnswer,
  SuggestionChips,
  TextAnswer,
  isFieldRequired,
  type FieldValues,
} from "@/components/quickstart/QuestionInputs";
import { WritingScreen } from "@/components/quickstart/WritingScreen";
import { ReadyScreen } from "@/components/quickstart/ReadyScreen";
import { PlanLimitDialog } from "@/components/shared/PlanLimitDialog";

type Draft = string | string[] | FieldValues;

interface FinishState {
  cvId: number;
  context: CareerMentorStep["context"];
  hasExperience: boolean;
}

// Free-text steps that describe what the user did get the "numbers" nudge.
const WORK_STEPS = new Set(["exp_work", "exp_work_followup", "project_work", "project_work_followup"]);

const TEXT_LABELS: Record<string, string> = {
  target_role: "Job you want",
  exp_work: "What you did",
  exp_work_followup: "One more detail",
  project_name: "Project name",
  project_work: "What you did",
  project_work_followup: "One more detail",
  goal: "Your next step",
};

function initialDraft(step: CareerMentorStep): Draft {
  const prefill = step.prefill;
  switch (step.input_type) {
    case "list":
      return Array.isArray(prefill) ? (prefill as string[]) : [];
    case "fields": {
      const values: FieldValues = {};
      for (const f of step.fields ?? []) values[f.name] = f.type === "checkbox" ? false : "";
      return prefill && typeof prefill === "object" ? { ...values, ...(prefill as FieldValues) } : values;
    }
    default:
      return typeof prefill === "string" ? prefill : "";
  }
}

function isEmpty(step: CareerMentorStep, draft: Draft): boolean {
  if (Array.isArray(draft)) return draft.length === 0;
  if (typeof draft === "string") return !draft.trim();
  return (step.fields ?? []).every((f) => f.type === "checkbox" || !String(draft[f.name] ?? "").trim());
}

// Mirrors the backend's normalize_answer rules so Continue is only enabled when
// the answer will be accepted (the backend still re-validates everything).
function isValid(step: CareerMentorStep, draft: Draft): boolean {
  if (step.input_type === "buttons") return (step.options ?? []).some((o) => o.value === draft);
  if (step.input_type === "fields") {
    const values = draft as FieldValues;
    return (step.fields ?? []).every((f) => f.type === "checkbox" || !isFieldRequired(f, values) || String(values[f.name] ?? "").trim());
  }
  return !isEmpty(step, draft);
}

/** Optional steps (and steps whose fields are all optional) can be skipped. */
function isSkippable(step: CareerMentorStep): boolean {
  return step.optional || (step.input_type === "fields" && (step.fields ?? []).every((f) => !f.required));
}

function toAnswer(step: CareerMentorStep, draft: Draft): CareerMentorAnswer {
  if (typeof draft === "string") return draft.trim();
  return draft;
}

export default function QuickStartQuestionsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "question" | "writing" | "ready">("loading");
  const [step, setStep] = useState<CareerMentorStep | null>(null);
  const [draft, setDraft] = useState<Draft>("");
  const [ack, setAck] = useState<string | null>(null);
  const [busy, setBusy] = useState<"answer" | "back" | "skip" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [finish, setFinish] = useState<FinishState | null>(null);
  const [finishDone, setFinishDone] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [readyCvId, setReadyCvId] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const startedRef = useRef(false);

  const showStep = (next: CareerMentorStep, nextAck: string | null) => {
    setStep(next);
    setDraft(initialDraft(next));
    setAck(nextAck);
    setError(null);
    setPhase("question");
    saveQuickStart({ phase: "question", step: next });
  };

  const runFinish = async (state: FinishState) => {
    setFinish(state);
    setFinishDone(false);
    setPhase("writing");
    saveQuickStart({ phase: "finish", ...state });
    try {
      await careerMentorApi.finish({ cv_id: state.cvId, context: state.context });
    } catch (err) {
      // 409 = already generated (e.g. a reload after it finished): the CV is done.
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 409) {
        setFinishError(apiErrorMessage(err, "Zeni couldn't finish writing right now."));
        return;
      }
    }
    setFinishDone(true);
    saveQuickStart({ phase: "ready", cvId: state.cvId });
    window.setTimeout(() => {
      setReadyCvId(state.cvId);
      setPhase("ready");
    }, 600);
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const saved = loadQuickStart();
    if (saved?.phase === "question") return showStep(saved.step, null);
    if (saved?.phase === "finish") {
      runFinish({ cvId: saved.cvId, context: saved.context, hasExperience: saved.hasExperience });
      return;
    }
    if (saved?.phase === "ready") {
      setReadyCvId(saved.cvId);
      setPhase("ready");
      return;
    }
    careerMentorApi
      .start()
      .then((res) => showStep(res.data, null))
      .catch((err) => {
        setPhase("question");
        setError(apiErrorMessage(err, "Couldn't start. Please check your connection and try again."));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move focus to the new question so screen readers announce it.
  useEffect(() => {
    if (phase === "question" && step) headingRef.current?.focus({ preventScroll: true });
  }, [phase, step?.step]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!step || busy) return;
    const skipping = isSkippable(step) && isEmpty(step, draft);
    if (!skipping && !isValid(step, draft)) return;
    const answer = toAnswer(step, draft);
    setBusy("answer");
    setError(null);
    try {
      const res = await careerMentorApi.answer({ cv_id: step.cv_id, step: step.step, answer, context: step.context });
      const next = res.data;
      if (next.complete && next.cv_id) {
        runFinish({ cvId: next.cv_id, context: next.context, hasExperience: next.context.has_experience !== "no" });
      } else {
        showStep(next, skipping ? null : getAck(step.step, answer, next.step));
      }
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const message = apiErrorMessage(err, "Couldn't save that answer. Please try again.");
      if (status === 403) setLimitMessage(message);
      else setError(message);
    } finally {
      setBusy(null);
    }
  };

  const goBack = async () => {
    if (!step || busy) return;
    if (!step.can_go_back) {
      router.push("/cv-builder/start");
      return;
    }
    setBusy("back");
    setError(null);
    try {
      const res = await careerMentorApi.back({ cv_id: step.cv_id, step: step.step, context: step.context });
      showStep(res.data, null);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't go back. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  // Skip: before the first answer there's no CV yet, so behave like "Fill it in
  // myself"; afterwards open the CV the quick-start already created.
  const skip = async () => {
    if (busy) return;
    if (step?.cv_id) {
      clearQuickStart();
      router.push(`/cv-builder/${step.cv_id}`);
      return;
    }
    setBusy("skip");
    try {
      const id = await createBuilderCv();
      clearQuickStart();
      router.push(`/cv-builder/${id}`);
    } catch (err) {
      setLimitMessage(apiErrorMessage(err, "Couldn't create your CV. Please try again."));
      setBusy(null);
    }
  };

  if (phase === "writing" && finish) {
    return (
      <WritingScreen
        hasExperience={finish.hasExperience}
        done={finishDone}
        error={finishError}
        retrying={retrying}
        onRetry={async () => {
          setRetrying(true);
          setFinishError(null);
          await runFinish(finish);
          setRetrying(false);
        }}
        onContinueWithout={() => {
          clearQuickStart();
          router.push(`/cv-builder/${finish.cvId}`);
        }}
      />
    );
  }

  if (phase === "ready" && readyCvId) return <ReadyScreen cvId={readyCvId} />;

  const skippable = step ? isSkippable(step) : false;
  const empty = step ? isEmpty(step, draft) : true;
  const showSkipLabel = skippable && empty;
  const canContinue = !!step && !busy && (showSkipLabel || isValid(step, draft));
  const progress = step?.progress ?? { current: 1, total: 11 };

  return (
    <QuickStartShell
      header={
        <>
          <div className="flex items-center justify-between gap-2 px-2 pt-2">
            <button
              type="button"
              aria-label="Back"
              onClick={goBack}
              disabled={!step || !!busy}
              className={cn(
                "w-11 h-11 rounded-lg flex items-center justify-center text-[#c9d1d9] hover:text-white hover:bg-[#21262d] disabled:opacity-40 transition-colors",
                focusRing,
              )}
            >
              {busy === "back" ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <ArrowLeft className="w-5 h-5" aria-hidden="true" />}
            </button>
            <p className="text-sm text-[#8b949e] font-medium" aria-live="polite">
              {step && `Step ${progress.current} of ${progress.total}`}
            </p>
            <button
              type="button"
              onClick={skip}
              disabled={!!busy}
              className={cn(
                "min-h-[44px] px-3 rounded-lg text-sm font-medium text-[#c9d1d9] hover:text-white hover:bg-[#21262d] disabled:opacity-40 transition-colors inline-flex items-center gap-1.5",
                focusRing,
              )}
            >
              {busy === "skip" && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              Skip
            </button>
          </div>
          <div
            role="progressbar"
            aria-label="Progress"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.current}
            className="h-1 bg-[#21262d] mt-1"
          >
            <div
              className="h-full bg-[#2563eb] transition-[width] duration-300"
              style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }}
            />
          </div>
        </>
      }
      footer={
        <div>
          {error && (
            <p role="alert" className="text-sm text-red-400 mb-2.5">
              {error}
            </p>
          )}
          <button type="button" onClick={submit} disabled={!canContinue} className={primaryButton} data-qs-continue>
            {busy === "answer" && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {showSkipLabel ? "Skip this question" : "Continue"}
          </button>
        </div>
      }
      mainClassName="pt-5 pb-6"
    >
      {phase === "loading" || !step ? (
        <div className="flex items-center justify-center py-20">
          {!error && <Loader2 className="w-6 h-6 text-blue-400 animate-spin" aria-label="Loading" />}
        </div>
      ) : (
        <div key={step.step} data-step={step.step} className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          {ack && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-300 mb-4">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {ack}
            </p>
          )}
          <div className="flex items-center gap-2">
            <ZeniAvatar />
            <span className="text-sm font-medium text-[#8b949e]">Zeni</span>
          </div>
          <h1 ref={headingRef} tabIndex={-1} className="text-white text-[22px] leading-snug font-bold mt-3 focus:outline-none">
            {step.question}
          </h1>
          {step.hint && <p className="text-[#8b949e] text-[15px] mt-2">{step.hint}</p>}

          <div className="mt-6">
            <StepInput step={step} draft={draft} setDraft={setDraft} onEnter={submit} />
          </div>

          {WORK_STEPS.has(step.step) && (
            <p className="text-[13px] text-[#8b949e] mt-3">Know any numbers? Add them. If not, that&apos;s okay.</p>
          )}
        </div>
      )}

      <PlanLimitDialog message={limitMessage} onClose={() => setLimitMessage(null)} />
    </QuickStartShell>
  );
}

function StepInput({
  step,
  draft,
  setDraft,
  onEnter,
}: {
  step: CareerMentorStep;
  draft: Draft;
  setDraft: (d: Draft) => void;
  onEnter: () => void;
}) {
  switch (step.input_type) {
    case "buttons":
      return (
        <ChoiceCards
          label={step.question}
          options={step.options ?? []}
          value={typeof draft === "string" ? draft : ""}
          onChange={setDraft}
          layout={step.step === "has_experience" ? "pair" : "list"}
        />
      );
    case "list":
      return (
        <SkillsAnswer
          suggestions={skillSuggestions(String(step.context.target_role ?? ""))}
          value={Array.isArray(draft) ? draft : []}
          onChange={setDraft}
        />
      );
    case "fields":
      if (step.step === "exp_dates") return <DatesAnswer values={draft as FieldValues} onChange={setDraft} />;
      return <FieldsAnswer fields={step.fields ?? []} values={draft as FieldValues} onChange={setDraft} onEnter={onEnter} />;
    default: {
      const value = typeof draft === "string" ? draft : "";
      const long = WORK_STEPS.has(step.step) || step.step === "goal";
      return (
        <div className="flex flex-col gap-4">
          <TextAnswer
            label={TEXT_LABELS[step.step] ?? "Your answer"}
            value={value}
            onChange={setDraft}
            onEnter={onEnter}
            multiline={long}
            maxLength={long ? (step.step === "goal" ? 300 : 1000) : 200}
            placeholder={step.step === "target_role" ? "e.g. Accountant" : undefined}
          />
          {step.step === "target_role" && (
            <SuggestionChips
              label="Popular jobs"
              options={ROLE_SUGGESTIONS}
              isSelected={(role) => value.trim().toLowerCase() === role.toLowerCase()}
              onPick={setDraft}
            />
          )}
        </div>
      );
    }
  }
}
