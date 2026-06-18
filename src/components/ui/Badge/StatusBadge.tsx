import type { StatusCategory } from "@/types/app/jira";

const MAP: Record<StatusCategory, { cls: string; label: string }> = {
  todo: { cls: "badge-ghost", label: "To Do" },
  inprogress: { cls: "badge-info", label: "In Progress" },
  done: { cls: "badge-success", label: "Done" },
};

export default function StatusBadge({
  category,
  label,
}: {
  category: StatusCategory;
  label?: string;
}) {
  const m = MAP[category];
  return <span className={`badge ${m.cls} badge-sm`}>{label ?? m.label}</span>;
}
