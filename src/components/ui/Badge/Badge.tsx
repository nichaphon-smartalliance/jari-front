import type { ReactNode } from "react";

export type BadgeColor = "gray" | "brand" | "success" | "warning" | "error" | "blue";

const COLORS: Record<BadgeColor, { wrap: string; dot: string }> = {
  gray: { wrap: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-500" },
  brand: { wrap: "bg-brand-50 text-brand-700 border-brand-200", dot: "bg-brand-500" },
  success: { wrap: "bg-success-50 text-success-700 border-success-200", dot: "bg-success-500" },
  warning: { wrap: "bg-warning-50 text-warning-700 border-warning-200", dot: "bg-warning-500" },
  error: { wrap: "bg-error-50 text-error-700 border-error-200", dot: "bg-error-500" },
  blue: { wrap: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
};

export default function Badge({
  color = "gray",
  dot = false,
  children,
}: {
  color?: BadgeColor;
  dot?: boolean;
  children: ReactNode;
}) {
  const c = COLORS[color];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${c.wrap}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />}
      {children}
    </span>
  );
}
