import type { ReactNode } from "react";

export function LoadingBlock({ label = "กำลังโหลด..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-base-content/60">
      <span className="loading loading-spinner loading-md" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBlock({ label = "เกิดข้อผิดพลาด" }: { label?: string }) {
  return (
    <div className="alert alert-error">
      <span>{label}</span>
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
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-base-content/50">
      {icon}
      <span>{label}</span>
    </div>
  );
}
