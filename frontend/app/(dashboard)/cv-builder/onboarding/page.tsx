"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, Check, CheckCircle2, Circle } from "lucide-react";
import { careerMentorApi, type CareerMentorStep } from "@/lib/api";
import type { TemplateId } from "@/types";

interface HistoryItem {
  question: string;
  answer: string;
}

type RevealPhase = "typing" | "ack" | "question" | "complete";

const CHECKLIST_ITEMS: { key: string; label: string }[] = [
  { key: "personal", label: "Personal Details" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "summary", label: "Summary" },
];

function computeDoneKeys(context: Record<string, string>): Set<string> {
  const has = (k: string) => Boolean((context[k] ?? "").trim());
  const done = new Set<string>();
  if (has("target_role")) done.add("personal");
  if (has("exp_work") || has("project_work")) done.add("experience");
  if (has("edu_dates")) done.add("education");
  if (has("skills")) done.add("skills");
  if (has("summary_years")) done.add("summary");
  return done;
}

function formatList(items: string[]): string {
  if (items.length === 0) return "your CV";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function pick(variants: string[]): string {
  return variants[Math.floor(Math.random() * variants.length)];
}

// Short, warm reactions to the answer just given, shown before the next
// question. Each step has a small set of natural variations so the flow
// doesn't repeat the exact same phrase every time.
const FOLLOWUP_ACKS = [
  "Thanks for that — let's dig a little deeper.",
  "Got it — one more quick thing.",
  "Good start — let's add a bit more.",
];

function getAck(step: string, answer: string, nextStep?: string): string {
  // Heading into the one-shot "tell me more" round — same reply regardless
  // of whether it was triggered from Experience or Projects.
  if (nextStep === "exp_work_followup" || nextStep === "project_work_followup") {
    return pick(FOLLOWUP_ACKS);
  }

  const normalized = answer.trim().toLowerCase();
  switch (step) {
    case "target_role":
      return pick([`${answer} — got it!`, `Nice, ${answer} it is.`, `Great, aiming for ${answer}.`]);
    case "career_stage":
      return pick(["Thanks, noted.", "Got it, that helps.", "Good to know."]);
    case "has_experience":
      return normalized === "yes"
        ? pick(["Great, let's talk about it.", "Awesome, let's dig into that.", "Nice — let's hear more."])
        : pick(["No worries — let's look at projects instead.", "That's fine, we'll cover projects instead.", "All good — let's talk projects."]);
    case "exp_company":
      return pick(["Nice, tell me more about that role.", "Got it — let's talk about your time there.", "Good, let's dig into that role."]);
    case "exp_title":
      return pick(["Got it.", "Noted.", "Good to know."]);
    case "exp_start":
      return pick(["Noted.", "Got it.", "Thanks."]);
    case "exp_end":
      return pick(["Got it.", "Noted.", "Thanks."]);
    case "exp_work":
    case "exp_work_followup":
      return pick(["Sounds great!", "Nice, that's solid experience.", "Great — that's useful detail."]);
    case "has_projects":
      return normalized === "yes"
        ? pick(["Love that — let's hear about it.", "Nice, let's dig in.", "Great, tell me more."])
        : pick(["No problem, let's move to education.", "That's fine — let's cover education.", "All good, on to education."]);
    case "project_name":
      return pick(["Cool, tell me more.", "Nice, let's hear about it.", "Got it, tell me more."]);
    case "project_work":
    case "project_work_followup":
      return pick(["Nice work!", "That sounds great.", "Great — that's helpful detail."]);
    case "edu_institution":
      return pick(["Got it.", "Noted.", "Thanks."]);
    case "edu_degree":
      return pick(["Nice.", "Good to know.", "Got it."]);
    case "edu_dates":
      return pick(["Noted.", "Got it.", "Thanks."]);
    case "skills":
      return pick(["Great skill set!", "Nice mix of skills.", "That's a solid set of skills."]);
    case "has_certifications":
      return normalized === "yes"
        ? pick(["Nice, let's add those.", "Great, tell me about them."])
        : pick(["No problem, moving on.", "That's fine — on we go."]);
    case "certifications_list":
      return pick(["Nice, that'll strengthen your CV.", "Great, noted."]);
    case "languages":
      return pick(["Good to know.", "Noted, thanks."]);
    case "summary_intro":
      return pick(["Love that.", "Great intro.", "Nice, that's a good start."]);
    case "summary_enjoy":
      return pick(["That's great to know.", "Nice, good to know.", "Great, noted."]);
    case "summary_years":
      return pick(["Perfect, almost done!", "Great, almost there!", "Nice, just about done!"]);
    default:
      return "Got it!";
  }
}

function MentorAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const dims = size === "lg" ? "w-14 h-14" : "w-7 h-7";
  const iconDims = size === "lg" ? "w-6 h-6" : "w-3.5 h-3.5";
  return (
    <div
      className={`${dims} rounded-full flex items-center justify-center flex-shrink-0 text-white`}
      style={{ backgroundColor: "#2563eb" }}
    >
      <Sparkles className={iconDims} />
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2 animate-in fade-in duration-200" aria-label="Career Mentor is typing">
      <MentorAvatar />
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" style={{ animationDelay: "0.2s" }} />
        <span className="typing-dot" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

function MentorBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <MentorAvatar />
      <div className="max-w-[85%] bg-[#161b22] border border-[#30363d] text-[#e6edf3] text-sm rounded-2xl rounded-bl-sm px-4 py-2.5">
        {children}
      </div>
    </div>
  );
}

function MentorAckBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <MentorAvatar />
      <div className="max-w-[85%] bg-[#161b22]/60 border border-[#30363d]/60 text-[#8b949e] text-xs italic rounded-2xl rounded-bl-sm px-3.5 py-2">
        {text}
      </div>
    </div>
  );
}

function ChecklistPanel({
  doneKeys,
  flashKeys,
  className,
}: {
  doneKeys: Set<string>;
  flashKeys: Set<string>;
  className: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
        Building your CV
      </p>
      <div className="flex flex-col gap-2">
        {CHECKLIST_ITEMS.map((item) => {
          const done = doneKeys.has(item.key);
          const flashing = flashKeys.has(item.key);
          return (
            <div
              key={item.key}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border transition-colors duration-500 ${
                done ? "border-blue-600/30 bg-blue-600/5" : "border-[#30363d] bg-transparent"
              } ${flashing ? "checklist-flash" : ""}`}
            >
              {done ? (
                <CheckCircle2
                  className={`w-4 h-4 text-blue-400 flex-shrink-0 ${flashing ? "animate-in zoom-in duration-300" : ""}`}
                />
              ) : (
                <Circle className="w-4 h-4 text-[#484f58] flex-shrink-0" />
              )}
              <span className={`text-xs ${done ? "text-[#e6edf3]" : "text-[#8b949e]"}`}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WelcomeScreen({
  onStart,
  starting,
  error,
}: {
  onStart: () => void;
  starting: boolean;
  error: string | null;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 px-4">
      <div className="animate-in zoom-in duration-500">
        <MentorAvatar size="lg" />
      </div>
      <div className="space-y-2 max-w-sm animate-in fade-in slide-in-from-bottom-1 duration-500">
        <p className="text-white font-semibold text-lg">👋 Welcome to ZenzHire!</p>
        <p className="text-[#8b949e] text-sm leading-relaxed">
          I&apos;m your Career Mentor. I&apos;ll help you build your CV in about 5 minutes.
        </p>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        onClick={onStart}
        disabled={starting}
        className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2"
      >
        {starting && <Loader2 className="w-4 h-4 animate-spin" />}
        Let&apos;s start
      </button>
    </div>
  );
}

function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = (searchParams.get("template") ?? "classic") as TemplateId;

  const [cvId, setCvId] = useState<number | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [inputType, setInputType] = useState<"text" | "buttons" | "none">("text");
  const [options, setOptions] = useState<string[] | null>(null);
  const [progress, setProgress] = useState({ current: 1, total: 18 });
  const [context, setContext] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [textValue, setTextValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [started, setStarted] = useState(false);
  const [awaitingStart, setAwaitingStart] = useState(false);
  const [prefetched, setPrefetched] = useState<CareerMentorStep | null>(null);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("question");
  const [ackText, setAckText] = useState<string | null>(null);
  const [mobileChecklistOpen, setMobileChecklistOpen] = useState(false);
  const [flashKeys, setFlashKeys] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const revealTimers = useRef<number[]>([]);
  const prevDoneRef = useRef<Set<string>>(new Set());

  const doneKeys = useMemo(() => computeDoneKeys(context), [context]);

  useEffect(() => {
    const newlyDone = [...doneKeys].filter((k) => !prevDoneRef.current.has(k));
    prevDoneRef.current = doneKeys;
    if (newlyDone.length > 0) {
      setFlashKeys(new Set(newlyDone));
      const t = window.setTimeout(() => setFlashKeys(new Set()), 1200);
      return () => window.clearTimeout(t);
    }
  }, [doneKeys]);

  const clearRevealTimers = () => {
    revealTimers.current.forEach((t) => window.clearTimeout(t));
    revealTimers.current = [];
  };

  useEffect(() => clearRevealTimers, []);

  const finalizeReveal = (data: CareerMentorStep) => {
    setStep(data.step);
    setQuestion(data.question);
    setInputType(data.input_type);
    setOptions(data.options);
    setComplete(data.complete);
    setRevealPhase(data.complete ? "complete" : "question");
  };

  const revealNext = (data: CareerMentorStep, ack: string | null) => {
    setCvId(data.cv_id);
    setProgress(data.progress);
    setContext(data.context ?? {});
    setAckText(ack);
    setRevealPhase("typing");
    const t1 = window.setTimeout(() => {
      if (ack) {
        setRevealPhase("ack");
        const t2 = window.setTimeout(() => finalizeReveal(data), 500);
        revealTimers.current.push(t2);
      } else {
        finalizeReveal(data);
      }
    }, 750);
    revealTimers.current.push(t1);
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    careerMentorApi
      .start(templateId)
      .then((res) => {
        setCvId(res.data.cv_id);
        setPrefetched(res.data);
      })
      .catch(() => setError("Couldn't start the conversation. Please try again."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (awaitingStart && prefetched) {
      setAwaitingStart(false);
      setStarted(true);
      revealNext(prefetched, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingStart, prefetched]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, revealPhase, ackText, question, complete, mobileChecklistOpen]);

  const handleStart = () => {
    setError(null);
    if (prefetched) {
      setStarted(true);
      revealNext(prefetched, null);
    } else {
      setAwaitingStart(true);
    }
  };

  const submitAnswer = async (answerValue: string) => {
    if (!cvId || !step || submitting || revealPhase !== "question") return;
    const trimmed = answerValue.trim();
    if (!trimmed) return;

    const askedQuestion = question;
    const answeredStep = step;
    setHistory((prev) => [...prev, { question: askedQuestion, answer: trimmed }]);
    setTextValue("");
    setSubmitting(true);
    setError(null);
    try {
      const res = await careerMentorApi.answer({ cv_id: cvId, step, answer: trimmed, context });
      setSubmitting(false);
      revealNext(res.data, getAck(answeredStep, trimmed, res.data.step));
    } catch {
      setError("Something went wrong saving that answer — please try again.");
      setHistory((prev) => prev.slice(0, -1));
      setSubmitting(false);
    }
  };

  const handleSkip = () => router.push(cvId ? `/cv-builder/${cvId}` : "/cv-builder");

  const inputBusy = submitting || revealPhase !== "question";
  const doneLabels = CHECKLIST_ITEMS.filter((i) => doneKeys.has(i.key)).map((i) => i.label);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden max-w-2xl w-full mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between py-4 flex-shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span className="text-white font-semibold text-sm whitespace-nowrap">Career Mentor</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {started && !complete && (
                <button
                  onClick={() => setMobileChecklistOpen((v) => !v)}
                  className="md:hidden flex items-center gap-1 text-[11px] text-[#8b949e] hover:text-white border border-[#30363d] rounded-full px-2.5 py-1 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" /> {doneKeys.size}/{CHECKLIST_ITEMS.length}
                </button>
              )}
              <button
                onClick={handleSkip}
                className="text-xs text-[#8b949e] hover:text-white transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Skip for now — I&apos;ll fill this in myself</span>
                <span className="sm:hidden">Skip</span>
              </button>
            </div>
          </div>

          {!started ? (
            <WelcomeScreen onStart={handleStart} starting={awaitingStart} error={error} />
          ) : (
            <>
              {/* Mobile collapsible checklist */}
              {mobileChecklistOpen && !complete && (
                <div className="md:hidden mb-3 animate-in slide-in-from-top-1 fade-in duration-200 flex-shrink-0">
                  <ChecklistPanel
                    doneKeys={doneKeys}
                    flashKeys={flashKeys}
                    className="bg-[#161b22] border border-[#30363d] rounded-lg p-3"
                  />
                </div>
              )}

              {/* Progress */}
              {!complete && !error && (
                <div className="flex-shrink-0 mb-4">
                  <p className="text-[11px] text-[#8b949e] mb-1.5">
                    Step {Math.min(progress.current, progress.total)} of {progress.total}
                  </p>
                  <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Chat history */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
                {history.map((h, i) => (
                  <div key={i} className="space-y-2">
                    <MentorBubble>{h.question}</MentorBubble>
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-blue-600 text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5">
                        {h.answer}
                      </div>
                    </div>
                  </div>
                ))}

                {revealPhase === "typing" && <TypingBubble />}
                {revealPhase === "ack" && ackText && <MentorAckBubble text={ackText} />}
                {revealPhase === "question" && !complete && question && <MentorBubble>{question}</MentorBubble>}

                {complete && (
                  <div className="flex flex-col items-center text-center gap-3 py-10 animate-in fade-in duration-500">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping" />
                      <div className="relative w-16 h-16 rounded-full bg-blue-600/10 border border-blue-600/30 flex items-center justify-center animate-in zoom-in duration-500">
                        <Check className="w-7 h-7 text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base">🎉 Your CV is ready!</p>
                      <p className="text-[#8b949e] text-sm mt-1.5 max-w-sm">
                        Here&apos;s what I built for you — {formatList(doneLabels)}, all ready to review.
                      </p>
                    </div>
                    <button
                      onClick={() => cvId && router.push(`/cv-builder/${cvId}`)}
                      className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      View My CV
                    </button>
                  </div>
                )}
              </div>

              {/* Input area */}
              {!complete && (
                <div className="flex-shrink-0 border-t border-[#30363d] py-4">
                  {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

                  {inputBusy ? (
                    <div className="flex items-center gap-2 text-[#8b949e] text-sm py-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> {submitting ? "Saving..." : "Mentor is responding..."}
                    </div>
                  ) : inputType === "buttons" && options ? (
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => submitAnswer(opt)}
                          className="px-4 py-2 rounded-full border border-[#30363d] text-[#e6edf3] text-sm hover:border-blue-500 hover:bg-blue-600/10 hover:text-blue-400 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : inputType === "text" ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && textValue.trim()) submitAnswer(textValue);
                        }}
                        placeholder="Type your answer..."
                        className="flex-1 bg-[#161b22] border border-[#30363d] rounded-full px-4 py-2.5 text-sm text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        onClick={() => textValue.trim() && submitAnswer(textValue)}
                        disabled={!textValue.trim()}
                        className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop live checklist sidebar */}
        {started && !complete && (
          <ChecklistPanel
            doneKeys={doneKeys}
            flashKeys={flashKeys}
            className="hidden md:block w-56 flex-shrink-0 border-l border-[#30363d] p-4 overflow-y-auto"
          />
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 64px)" }}>
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      }
    >
      <OnboardingFlow />
    </Suspense>
  );
}
