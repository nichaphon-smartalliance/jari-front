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
  StatusCategory,
} from "@/types/app/jira";

// ─── Reference data (#2) ─────────────────────────────────────────────────────

export const getProjects = () => apiGet<Project[]>("/projects");

export const getUsers = () => apiGet<JiraUser[]>("/users");

// ─── Dashboard (#1) ──────────────────────────────────────────────────────────

export const getDashboard = () => apiGet<DashboardData>("/dashboard");

// ─── My work (#3) ────────────────────────────────────────────────────────────

export async function getMyOpenIssues(
  accountId: string,
  statusCategories?: StatusCategory[],
): Promise<Issue[]> {
  if (!accountId) return [];
  const params = new URLSearchParams({ accountId });
  if (statusCategories?.length) params.set("status", statusCategories.join(","));
  const { issues } = await apiGet<{ issues: Issue[] }>(`/my-issues?${params.toString()}`);
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

// ─── Dashboard reports (#1 workload · #2 timeline · #3 project status) ────────

export interface SprintWorkloadPerson {
  accountId: string;
  displayName: string;
  waiting: number;
  done: number;
  total: number;
}

export async function getSprintWorkload(): Promise<SprintWorkloadPerson[]> {
  const { people } = await apiGet<{ people: SprintWorkloadPerson[] }>("/reports/workload");
  return people;
}

export interface SprintTimeline {
  days: string[];
  people: { accountId: string; displayName: string; daily: number[] }[];
}

export const getSprintTimeline = () => apiGet<SprintTimeline>("/reports/timeline");

export interface ProjectStatus {
  projectKey: string;
  projectName: string;
  totalStories: number;
  storyStatuses: {
    status: string;
    count: number;
    subtaskCategories: { category: string; count: number }[];
  }[];
}

export async function getProjectStatus(): Promise<ProjectStatus[]> {
  const { projects } = await apiGet<{ projects: ProjectStatus[] }>("/reports/project-status");
  return projects;
}

// ─── Daily 8h view (#5) ──────────────────────────────────────────────────────

export const getDailyData = (date: string) =>
  apiGet<DailyData>(`/daily?date=${encodeURIComponent(date)}`);

// ─── Jira account linking (Settings) ─────────────────────────────────────────

export interface JiraAccountStatus {
  username: string;
  displayName: string;
  jiraEmail: string;
  accountId: string;
  hasToken: boolean;
  tokenExpiresAt: string | null;
  tokenExpired: boolean;
}

export const getJiraAccount = () => apiGet<JiraAccountStatus>("/auth/jira-account");

export interface UpdateJiraAccountResult {
  token: string;
  user: { username: string; accountId: string; displayName: string };
  jiraEmail: string;
}

export const updateJiraAccount = (input: { email: string; token: string; expiresAt?: string }) =>
  apiPost<UpdateJiraAccountResult>("/auth/jira-account", input);

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
