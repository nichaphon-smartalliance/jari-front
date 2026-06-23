// Frontend domain types for Jari. Mirrors the data Jari syncs from Jira
// (Story -> Sub-task -> worklog) but shaped for UI consumption.

export type StatusCategory = "todo" | "inprogress" | "done" | "blocked" | "qa";
export type IssueType = "Story" | "Sub-task";
export type Priority = "Highest" | "High" | "Medium" | "Low" | "Lowest";

export interface JiraUser {
  accountId: string;
  displayName: string;
  email: string;
}

export interface Issue {
  id: string;
  key: string;
  summary: string;
  statusName: string;
  statusCategory: StatusCategory;
  issueType: IssueType;
  isSubtask: boolean;
  parentKey?: string;
  assignee?: JiraUser;
  priority?: Priority;
  projectKey: string;
  projectName: string;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  /** true when at least one worklog exists for this issue (drives feature #4) */
  hasWorklog: boolean;
}

export interface Worklog {
  id: string;
  issueKey: string;
  issueSummary: string;
  author: JiraUser;
  comment: string;
  startedAt: string; // ISO-8601 with +07:00
  timeSpentSeconds: number;
}

// ─── Dashboard (#1) ──────────────────────────────────────────────────────────

export interface DashboardKpis {
  totalIssues: number;
  completed: number;
  inProgress: number;
  blockedOrOverdue: number;
  completionRate: number; // 0..100
  onTimeRate: number; // 0..100
}

export interface TrendPoint {
  month: string; // "Jan"
  created: number;
  completed: number;
}

export interface AssigneeWorkload {
  accountId: string;
  displayName: string;
  todo: number;
  inProgress: number;
  done: number;
  loggedHoursToday: number;
}

export interface ProjectHealth {
  projectKey: string;
  projectName: string;
  total: number;
  done: number;
  overdue: number;
  healthScore: number; // 0..100
}

export interface SprintProgress {
  name: string;
  committed: number;
  completed: number;
  carryover: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  trend: TrendPoint[];
  workload: AssigneeWorkload[];
  projects: ProjectHealth[];
  sprint: SprintProgress;
}

// ─── Daily 8h view (#5) ──────────────────────────────────────────────────────

export interface DailyEntry {
  issueKey: string;
  issueSummary: string;
  hours: number;
}

export interface DailyPerson {
  accountId: string;
  displayName: string;
  totalSeconds: number;
  targetSeconds: number; // 8h = 28800
  status: "under" | "ok" | "over";
  entries: DailyEntry[];
}

export interface DailyData {
  date: string; // YYYY-MM-DD
  targetHours: number;
  people: DailyPerson[];
}

// ─── Create (#2) ─────────────────────────────────────────────────────────────

export interface Project {
  key: string;
  name: string;
}

export interface CreateStoryInput {
  projectKey: string;
  summary: string;
  description: string;
  priority: Priority;
  assigneeAccountId?: string;
  subtasks: string[];
}

// ─── AI (#6) ─────────────────────────────────────────────────────────────────

export interface WorklogPlanItem {
  issueKey: string;
  issueSummary: string;
  timeSpent: string; // "3h"
  seconds: number;
  comment: string;
}
