"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Lightweight dropdown (trigger + panel) with click-outside + Esc to close.
 * Replaces daisyUI's CSS `dropdown`/`menu`.
 */
export default function Dropdown({
  trigger,
  children,
  align = "end",
  width = "w-56",
}: {
  trigger: (open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)}>
        {trigger(open)}
      </button>
      {open && (
        <div
          className={`absolute z-50 mt-2 ${align === "end" ? "right-0" : "left-0"} ${width} ` +
            "overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg"}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  active = false,
  danger = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors " +
        (danger
          ? "text-error-600 hover:bg-error-50"
          : active
            ? "bg-gray-50 text-gray-900"
            : "text-gray-700 hover:bg-gray-50")
      }
    >
      {children}
    </button>
  );
}
