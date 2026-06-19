import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/Feedback";

export function LoadingBlock({ label = "กำลังโหลด..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
      <Spinner size={20} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBlock({ label = "เกิดข้อผิดพลาด" }: { label?: string }) {
  return (
    <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
      {label}
    </div>
  );
}

export function EmptyBlock({
  label = "ไม่มีข้อมูล",
  icon,
}: {
  label?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-gray-500">
      {icon && <div className="text-gray-400">{icon}</div>}
      <span className="text-sm">{label}</span>
    </div>
  );
}
