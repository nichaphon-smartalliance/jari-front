import type { Priority } from "@/types/app/jira";

const MAP: Record<Priority, string> = {
  Highest: "badge-error",
  High: "badge-warning",
  Medium: "badge-accent",
  Low: "badge-ghost",
  Lowest: "badge-ghost",
};

export default function PriorityBadge({ priority }: { priority?: Priority }) {
  if (!priority) return null;
  return <span className={`badge ${MAP[priority]} badge-sm badge-outline`}>{priority}</span>;
}
