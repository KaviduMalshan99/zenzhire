"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle2, AlertTriangle, MessageSquareText } from "lucide-react";
import { reviewsApi, ReviewItem } from "@/lib/api";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

type Status = "idle" | "submitting" | "success" | "error";

function StarRating({
  value,
  onChange,
  size = "w-7 h-7",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`${size} transition-colors ${
                filled ? "fill-blue-400 text-blue-400" : "fill-transparent text-[#30363d]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<{ name?: string; rating?: string; text?: string }>({});
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    reviewsApi
      .list()
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!rating) next.rating = "Please select a rating.";
    if (!text.trim()) next.text = "Review text is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    try {
      await reviewsApi.submit({ name: name.trim(), rating, text: text.trim() });
      setStatus("success");
      setName("");
      setRating(0);
      setText("");
      setErrors({});
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(37,99,235,0.20), transparent)",
          }}
        />
        <div className="relative max-w-2xl mx-auto px-6 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-6">
            Reviews
          </h1>
          <p className="text-lg text-[#8b949e] leading-relaxed">
            Real feedback from people building their CVs with ZenzHire.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        {/* Submit form */}
        <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8 mb-12">
          {status === "success" ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-12 h-12 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Thanks for your review!</h2>
              <p className="text-[#8b949e] text-sm max-w-sm">
                Your review has been submitted and will appear here once it&apos;s been
                reviewed by our team.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Leave another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="text-white font-semibold text-lg mb-6">Leave a review</h2>

              <div className="mb-5">
                <label htmlFor="review-name" className="block text-sm font-medium text-[#c9d1d9] mb-2">
                  Name
                </label>
                <input
                  id="review-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-[#484f58] outline-none transition-colors"
                  placeholder="Your name"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Rating</label>
                <StarRating value={rating} onChange={setRating} />
                {errors.rating && <p className="text-red-400 text-xs mt-1.5">{errors.rating}</p>}
              </div>

              <div className="mb-6">
                <label htmlFor="review-text" className="block text-sm font-medium text-[#c9d1d9] mb-2">
                  Your review
                </label>
                <textarea
                  id="review-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-md px-4 py-2.5 text-white text-sm placeholder:text-[#484f58] outline-none transition-colors resize-none"
                  placeholder="What was your experience with ZenzHire?"
                />
                {errors.text && <p className="text-red-400 text-xs mt-1.5">{errors.text}</p>}
              </div>

              {status === "error" && (
                <div className="flex items-start gap-2.5 bg-red-500/[0.06] border border-red-500/20 rounded-md px-4 py-3 mb-5">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">
                    Something went wrong submitting your review. Please try again.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-md transition-colors w-full sm:w-auto"
              >
                {status === "submitting" ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>

        {/* Reviews list */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-6">
            {!loading && reviews.length > 0 ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "Reviews"}
          </h2>

          {loading ? null : reviews.length === 0 ? (
            <div className="rounded-2xl border border-[#30363d] bg-[#161b22]/60 p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquareText className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-[#8b949e]">Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{r.name}</span>
                    <StarRating value={r.rating} size="w-4 h-4" />
                  </div>
                  <p className="text-[#8b949e] text-sm leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
