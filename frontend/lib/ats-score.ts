export interface ATSScoreLevel {
  label: string;
  color: string;
  sentence: string;
}

/**
 * Single source of truth for the ATS overall-score legend. Every UI location that
 * interprets `overall_score` (ScoreGauge badge, the results-page prose sentence,
 * ResultsSidebar's mini-gauge color) must derive its label/color from this function
 * so the three can never drift out of sync again.
 */
export function getATSScoreLevel(score: number): ATSScoreLevel {
  if (score >= 85) {
    return {
      label: "Excellent",
      color: "#22c55e",
      sentence: "Excellent CV — you're well-positioned for ATS screening.",
    };
  }
  if (score >= 70) {
    return {
      label: "Good",
      color: "#3b82f6",
      sentence: "Good foundation — targeted improvements will help.",
    };
  }
  if (score >= 50) {
    return {
      label: "Needs Improvement",
      color: "#f59e0b",
      sentence: "Needs improvement — several changes are recommended.",
    };
  }
  return {
    label: "Weak",
    color: "#ef4444",
    sentence: "Weak — significant improvements can be made.",
  };
}
