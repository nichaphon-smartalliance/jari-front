"use client";

import { CheckCircle2, ListChecks, PartyPopper } from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from "@/components/common";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
        icon={<ListChecks size={22} />}
      />

      {issues.length === 0 ? (
        <EmptyBlock label="เคลียร์งานหมดแล้ว! 🎉" icon={<PartyPopper size={32} />} />
      ) : (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
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
    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-gray-500">{issue.key}</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              issue.isSubtask
                ? "bg-blue-50 text-blue-700"
                : "bg-brand-50 text-brand-700"
            }`}
          >
            {issue.issueType}
          </span>
          {issue.parentKey && (
            <span className="text-xs text-gray-400">↳ {issue.parentKey}</span>
          )}
        </div>
        <div className="mt-0.5 truncate text-sm font-medium text-gray-900">{issue.summary}</div>
        <div className="mt-1.5 flex items-center gap-2">
          <StatusBadge category={issue.statusCategory} label={issue.statusName} />
          <PriorityBadge priority={issue.priority} />
          {issue.dueDate && (
            <span className="text-xs text-gray-500">กำหนด {issue.dueDate}</span>
          )}
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onDone}
        loading={loading}
        iconLeft={!loading && <CheckCircle2 size={16} className="text-success-600" />}
      >
        ปิดงาน
      </Button>
    </div>
  );
}
