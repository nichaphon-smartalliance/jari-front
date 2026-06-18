// Service layer — calls the Jari backend (jari-back, Hono on :4000).
// Return shapes are the frontend domain types, matching the backend exactly,
// so hooks and UI never change when endpoints evolve.

import { apiGet, apiPost } from "@/lib/api/client";
import type {
  CreateStoryInput,
  DailyData,
  DashboardData,
  Issue,
  JiraUser,
  Project,
} from "@/types/app/jira";

// ─── Reference data (#2) ─────────────────────────────────────────────────────

export const getProjects = () => apiGet<Project[]>("/projects");

export const getUsers = () => apiGet<JiraUser[]>("/users");

// ─── Dashboard (#1) ──────────────────────────────────────────────────────────

export const getDashboard = () => apiGet<DashboardData>("/dashboard");

// ─── My work (#3) ────────────────────────────────────────────────────────────

export async function getMyOpenIssues(accountId: string): Promise<Issue[]> {
  if (!accountId) return [];
  const { issues } = await apiGet<{ issues: Issue[] }>(
    `/my-issues?accountId=${encodeURIComponent(accountId)}`,
  );
  return issues;
}

export async function markIssueDone(key: string): Promise<{ key: string }> {
  return apiPost<{ ok: boolean; key: string }>(`/issues/${encodeURIComponent(key)}/done`);
}

// ─── Worklog candidates + create (#4) ────────────────────────────────────────

export async function getWorklogCandidates(accountId: string): Promise<Issue[]> {
  if (!accountId) return [];
  const { issues } = await apiGet<{ issues: Issue[] }>(
    `/worklog/candidates?accountId=${encodeURIComponent(accountId)}`,
  );
  return issues;
}

export async function createWorklog(input: {
  issueKey: string;
  seconds: number;
  comment: string;
  date: string;
}): Promise<{ ok: boolean }> {
  return apiPost("/worklog", {
    issueKey: input.issueKey,
    timeSpentSeconds: input.seconds,
    comment: input.comment,
    date: input.date,
  });
}

// ─── Daily 8h view (#5) ──────────────────────────────────────────────────────

export const getDailyData = (date: string) =>
  apiGet<DailyData>(`/daily?date=${encodeURIComponent(date)}`);

// ─── Create story + subtasks (#2) ────────────────────────────────────────────

export async function createStory(
  input: CreateStoryInput,
): Promise<{ storyKey: string; subtaskKeys: string[] }> {
  return apiPost("/stories", {
    projectKey: input.projectKey,
    summary: input.summary,
    description: input.description,
    priority: input.priority,
    assigneeAccountId: input.assigneeAccountId,
    subtasks: input.subtasks.map((s) => s.trim()).filter(Boolean),
  });
}
