"use client";

type Slice = { name: string; percentage: number };

export const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

export default function DonutChart({ slices }: { slices: Slice[] }) {
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circ = 2 * Math.PI * r;
  const total = slices.reduce((s, c) => s + c.percentage, 0);
  let offset = 0;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {/* Background track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#1e293b"
        strokeWidth={20}
      />
      {slices.map((s, i) => {
        const pct = s.percentage / total;
        const dash = `${pct * circ} ${circ}`;
        const rot = (offset / total) * 360 - 90;
        offset += s.percentage;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={20}
            strokeDasharray={dash}
            strokeDashoffset={0}
            transform={`rotate(${rot} ${cx} ${cy})`}
          />
        );
      })}
      {/* Inner hole */}
      <circle cx={cx} cy={cy} r={r - 12} fill="#111" />
    </svg>
  );
}
