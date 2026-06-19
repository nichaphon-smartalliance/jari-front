import type { Priority } from "@/types/app/jira";
import Badge, { type BadgeColor } from "./Badge";

const MAP: Record<Priority, BadgeColor> = {
  Highest: "error",
  High: "warning",
  Medium: "brand",
  Low: "gray",
  Lowest: "gray",
};

export default function PriorityBadge({ priority }: { priority?: Priority }) {
  if (!priority) return null;
  return <Badge color={MAP[priority]}>{priority}</Badge>;
}
