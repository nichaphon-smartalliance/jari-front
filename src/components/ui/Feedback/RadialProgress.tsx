/** Untitled UI–style circular progress ring with a centered percentage. */
export default function RadialProgress({
  value,
  size = 96,
  stroke = 8,
  trackClass = "text-gray-200",
  barClass = "text-brand-600",
  label,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  trackClass?: string;
  barClass?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, value)) / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={trackClass}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={barClass}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-semibold text-gray-900">{Math.round(value)}%</span>
        {label && <span className="text-[10px] text-gray-500">{label}</span>}
      </div>
    </div>
  );
}
