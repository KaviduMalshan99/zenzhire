"use client";

interface Props {
  score: number; // 0-100
  size?: number;
}

export function ScoreGauge({ score, size = 200 }: Props) {
  const radius = (size - 24) / 2;
  const circumference = Math.PI * radius; // half-circle arc length
  const pct = Math.min(100, Math.max(0, score));
  const filled = (pct / 100) * circumference;
  const gap = circumference - filled;

  const color =
    pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";

  const label =
    pct >= 75 ? "Strong" : pct >= 50 ? "Moderate" : "Needs Work";

  const cx = size / 2;
  const cy = size / 2 + radius * 0.18;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* track */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#30363d"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* filled arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap + 1}`}
          strokeDashoffset={0}
          style={{ transition: "stroke-dasharray 1s ease-out" }}
        />
        {/* score text */}
        <text
          x={cx}
          y={cy - radius * 0.18}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.18}
          fontWeight="700"
          fill={color}
        >
          {Math.round(pct)}
        </text>
        <text
          x={cx}
          y={cy + radius * 0.22}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.07}
          fill="#8b949e"
        >
          / 100
        </text>
      </svg>
      <span
        className="text-sm font-semibold px-3 py-0.5 rounded-full"
        style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
      >
        {label}
      </span>
    </div>
  );
}
