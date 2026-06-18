"use client";

import { CheckCircle2, ListChecks, PartyPopper } from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from "@/components/common";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { useMarkDone, useMyOpenIssues } from "@/hooks/jari";
import { useAuth } from "@/context/auth";
import type { Issue } from "@/types/app/jira";

export default function WorkContent() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useMyOpenIssues(user?.accountId ?? "");
  const markDone = useMarkDone();

  if (isLoading) return <LoadingBlock />;
  if (isError) return <ErrorBlock />;

  const issues = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="งานของฉัน"
        subtitle={`${user?.displayName ?? ""} · คลิกเดียวเพื่อปิดงานเป็น Done`}
        icon={<ListChecks size={26} />}
      />

      {issues.length === 0 ? (
        <EmptyBlock label="เคลียร์งานหมดแล้ว! 🎉" icon={<PartyPopper size={36} />} />
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <WorkRow
              key={issue.key}
              issue={issue}
              loading={markDone.isPending && markDone.variables === issue.key}
              onDone={() => markDone.mutate(issue.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkRow({
  issue,
  loading,
  onDone,
}: {
  issue: Issue;
  loading: boolean;
  onDone: () => void;
}) {
  return (
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body flex-row items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base-content/50 font-mono text-xs">{issue.key}</span>
            <span
              className={`badge badge-xs ${issue.isSubtask ? "badge-secondary" : "badge-primary"}`}
            >
              {issue.issueType}
            </span>
            {issue.parentKey && (
              <span className="text-base-content/40 text-xs">↳ {issue.parentKey}</span>
            )}
          </div>
          <div className="truncate font-medium">{issue.summary}</div>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge category={issue.statusCategory} label={issue.statusName} />
            <PriorityBadge priority={issue.priority} />
            {issue.dueDate && (
              <span className="text-base-content/50 text-xs">กำหนด {issue.dueDate}</span>
            )}
          </div>
        </div>
        <button onClick={onDone} disabled={loading} className="btn btn-success btn-sm gap-1">
          {loading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          ปิดงาน
        </button>
      </div>
    </div>
  );
}
