export default function GaugeArc({ score }: { score: number }) {
  const r = 70;
  const cx = 90;
  const cy = 90;
  const pct = Math.min(Math.max(score, 0), 100) / 100;

  // Semicircle: from left (cx-r, cy) going clockwise to right (cx+r, cy)
  const startX = cx - r;
  const startY = cy;

  // Angle of endpoint: 0 score = same as start (no arc), 100 = full semicircle
  const angleDeg = pct * 180; // 0..180
  const angleRad = (angleDeg * Math.PI) / 180;
  // Start angle is 180deg (left side of circle), progress goes clockwise
  // In standard math coords: end angle = 180 - angleDeg (from positive x axis)
  const endAngleMath = Math.PI - angleRad;
  const ex = cx + r * Math.cos(endAngleMath);
  const ey = cy - r * Math.sin(endAngleMath);

  const largeArc = angleDeg > 180 ? 1 : 0;

  const color =
    score <= 40
      ? "#ef4444"
      : score <= 60
      ? "#f59e0b"
      : score <= 80
      ? "#3b82f6"
      : "#10b981";

  return (
    <svg width="180" height="100" viewBox="0 0 180 100">
      {/* Track */}
      <path
        d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#1e293b"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Score arc */}
      {pct > 0 && (
        <path
          d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
        />
      )}
      {/* Needle dot */}
      {pct > 0 && <circle cx={ex} cy={ey} r={6} fill={color} />}
      {/* Start cap dot */}
      <circle cx={startX} cy={startY} r={4} fill="#1e293b" />
    </svg>
  );
}
