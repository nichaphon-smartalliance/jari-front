// AI service — proxies to jari-back /ai/* which calls the AI Center gateway
// (docs/03-ai-center.md). Return shapes stay stable for hooks/UI.

import { apiPost } from "@/lib/api/client";
import { WORKDAY_SECONDS, formatDuration } from "@/lib/format";
import type { Issue, WorklogPlanItem } from "@/types/app/jira";

/** #6 — clean up a roughly-typed story title/description. */
export async function rewriteText(
  raw: string,
  kind: "title" | "description",
): Promise<string> {
  if (!raw.trim()) return "";
  const { content } = await apiPost<{ content: string }>("/ai/rewrite", { raw, kind });
  return content;
}

/** #2 — suggest sub-task titles for a story. */
export async function suggestSubtasks(
  title: string,
  description: string,
): Promise<string[]> {
  const { subtasks } = await apiPost<{ subtasks: string[] }>("/ai/suggest-subtasks", {
    title,
    description,
  });
  return subtasks;
}

/** #6 — propose how to split remaining hours across Done sub-tasks to hit 8h. */
export async function planWorklogs(
  candidates: Issue[],
  alreadyLoggedSeconds: number,
): Promise<WorklogPlanItem[]> {
  const remainingSeconds = Math.max(0, WORKDAY_SECONDS - alreadyLoggedSeconds);
  if (candidates.length === 0 || remainingSeconds === 0) return [];

  const { plan } = await apiPost<{
    plan: { issueKey: string; timeSpentSeconds: number; comment: string }[];
  }>("/ai/plan-worklogs", {
    candidates: candidates.map((c) => ({ issueKey: c.key, summary: c.summary })),
    remainingSeconds,
  });

  const byKey = new Map(candidates.map((c) => [c.key, c]));
  return plan.map((p) => ({
    issueKey: p.issueKey,
    issueSummary: byKey.get(p.issueKey)?.summary ?? p.issueKey,
    timeSpent: formatDuration(p.timeSpentSeconds),
    seconds: p.timeSpentSeconds,
    comment: p.comment,
  }));
}
