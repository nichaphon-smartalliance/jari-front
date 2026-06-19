export type ProgressColor = "brand" | "success" | "warning" | "error" | "gray";

const FILL: Record<ProgressColor, string> = {
  brand: "bg-brand-600",
  success: "bg-success-600",
  warning: "bg-warning-500",
  error: "bg-error-600",
  gray: "bg-gray-400",
};

export default function ProgressBar({
  value,
  max = 100,
  color = "brand",
  className = "",
}: {
  value: number;
  max?: number;
  color?: ProgressColor;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${FILL[color]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
