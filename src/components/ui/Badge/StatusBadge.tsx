import type { StatusCategory } from "@/types/app/jira";
import Badge, { type BadgeColor } from "./Badge";

const MAP: Record<StatusCategory, { color: BadgeColor; label: string }> = {
  todo: { color: "gray", label: "To Do" },
  inprogress: { color: "blue", label: "In Progress" },
  done: { color: "success", label: "Done" },
};

export default function StatusBadge({
  category,
  label,
}: {
  category: StatusCategory;
  label?: string;
}) {
  const m = MAP[category];
  return (
    <Badge color={m.color} dot>
      {label ?? m.label}
    </Badge>
  );
}
