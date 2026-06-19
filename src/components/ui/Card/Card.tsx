import type { ReactNode } from "react";

/** Untitled UI surface: white, hairline border, soft shadow, generous radius. */
export default function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-xs ${
        padded ? "p-5" : ""
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
