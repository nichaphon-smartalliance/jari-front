// AI service — proxies to jari-back /ai/* which calls the AI Center gateway
// (docs/03-ai-center.md). Return shapes stay stable for hooks/UI.

import { apiPost } from "@/lib/api/client";
import { WORKDAY_SECONDS, formatDuration } from "@/lib/format";
import type { Issue, StoryDraft, WorklogPlanItem } from "@/types/app/jira";

/** #2 — turn a free-form brief into a ready-to-create Story draft in one call. */
export async function draftStory(brief: string): Promise<StoryDraft> {
  return apiPost<StoryDraft>("/ai/draft-story", { brief });
}

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

/** #6 — AI spreads the whole Done-sub-task backlog across past workdays (8h/day,
 *  skipping weekends), backward from `startDate`. Each item carries its date. */
export interface BackfillPlanItem {
  issueKey: string;
  issueSummary: string;
  date: string; // YYYY-MM-DD
  seconds: number;
  timeSpent: string;
  comment: string;
}

export async function backfillWorklogs(
  candidates: Issue[],
  accountId: string,
  startDate: string,
): Promise<BackfillPlanItem[]> {
  if (candidates.length === 0) return [];
  const { plan } = await apiPost<{
    plan: { issueKey: string; date: string; timeSpentSeconds: number; comment: string }[];
  }>("/ai/backfill-worklogs", {
    candidates: candidates.map((c) => ({ issueKey: c.key, summary: c.summary })),
    accountId,
    startDate,
    skipWeekends: true,
  });

  const byKey = new Map(candidates.map((c) => [c.key, c]));
  return plan.map((p) => ({
    issueKey: p.issueKey,
    issueSummary: byKey.get(p.issueKey)?.summary ?? p.issueKey,
    date: p.date,
    seconds: p.timeSpentSeconds,
    timeSpent: formatDuration(p.timeSpentSeconds),
    comment: p.comment,
  }));
}
