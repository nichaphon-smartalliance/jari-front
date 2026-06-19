"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Timer } from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/Feedback";
import {
  useCreateWorklog,
  useDailyData,
  usePlanWorklogs,
  useWorklogCandidates,
} from "@/hooks/jari";
import { useAuth } from "@/context/auth";
import { WORKDAY_SECONDS, formatDuration, parseDuration, todayISO } from "@/lib/format";

interface Draft {
  timeSpent: string;
  comment: string;
}

export default function WorklogContent() {
  const today = todayISO();
  const { user } = useAuth();
  const accountId = user?.accountId ?? "";
  const { data: candidates, isLoading, isError } = useWorklogCandidates(accountId);
  const { data: daily } = useDailyData(today);
  const plan = usePlanWorklogs();
  const createWorklog = useCreateWorklog();

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [submitting, setSubmitting] = useState(false);

  const loggedSeconds = useMemo(() => {
    const me = daily?.people.find((p) => p.accountId === accountId);
    return me?.totalSeconds ?? 0;
  }, [daily, accountId]);

  const draftSeconds = useMemo(
    () => Object.values(drafts).reduce((s, d) => s + parseDuration(d.timeSpent || ""), 0),
    [drafts],
  );
  const projected = loggedSeconds + draftSeconds;

  if (isLoading) return <LoadingBlock />;
  if (isError) return <ErrorBlock />;

  const list = candidates ?? [];
  const setDraft = (key: string, patch: Partial<Draft>) =>
    setDrafts((d) => {
      const prev = d[key] ?? { timeSpent: "", comment: "" };
      return { ...d, [key]: { ...prev, ...patch } };
    });

  const onAiFill = async () => {
    const items = await plan.mutateAsync({ candidates: list, alreadyLoggedSeconds: loggedSeconds });
    const next: Record<string, Draft> = {};
    for (const it of items) next[it.issueKey] = { timeSpent: it.timeSpent, comment: it.comment };
    setDrafts(next);
  };

  const onSubmitAll = async () => {
    setSubmitting(true);
    try {
      for (const issue of list) {
        const d = drafts[issue.key];
        const seconds = parseDuration(d?.timeSpent || "");
        if (seconds > 0) {
          await createWorklog.mutateAsync({
            issueKey: issue.key,
            seconds,
            comment: d.comment,
            date: today,
          });
        }
      }
      setDrafts({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ลงเวลางาน (Worklog)"
        subtitle={`${user?.displayName ?? ""} · ${today} — ดึง Sub-task ที่ Done แต่ยังไม่ลงเวลา`}
        icon={<Timer size={22} />}
        actions={
          list.length > 0 ? (
            <Button
              size="sm"
              onClick={onAiFill}
              loading={plan.isPending}
              iconLeft={!plan.isPending && <Sparkles size={16} />}
            >
              AI ลงเวลาให้ครบ 8 ชม.
            </Button>
          ) : undefined
        }
      />

      <ProgressCard logged={loggedSeconds} projected={projected} />

      {list.length === 0 ? (
        <EmptyBlock label="ไม่มี Sub-task ที่ Done ค้างลงเวลา 🎉" icon={<CheckCircle2 size={32} />} />
      ) : (
        <>
          <div className="space-y-3">
            {list.map((issue) => {
              const d = drafts[issue.key] ?? { timeSpent: "", comment: "" };
              return (
                <Card key={issue.key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">{issue.key}</span>
                    <span className="rounded-full bg-success-50 px-1.5 py-0.5 text-[10px] font-medium text-success-700">
                      Done
                    </span>
                    {issue.parentKey && (
                      <span className="text-xs text-gray-400">↳ {issue.parentKey}</span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{issue.summary}</div>
                  <div className="grid gap-2 sm:grid-cols-[150px_1fr]">
                    <Input
                      placeholder="เช่น 3h 30m"
                      value={d.timeSpent}
                      onChange={(e) => setDraft(issue.key, { timeSpent: e.target.value })}
                    />
                    <Input
                      placeholder="คอมเมนต์ (อะไรที่ทำไป)"
                      value={d.comment}
                      onChange={(e) => setDraft(issue.key, { comment: e.target.value })}
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3">
            <span className="text-sm text-gray-600">
              จะลงเวลารวม {formatDuration(draftSeconds)}
            </span>
            <Button onClick={onSubmitAll} loading={submitting} disabled={draftSeconds === 0}>
              ลงเวลาทั้งหมด
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ProgressCard({ logged, projected }: { logged: number; projected: number }) {
  const pct = Math.min(100, Math.round((projected / WORKDAY_SECONDS) * 100));
  const remaining = Math.max(0, WORKDAY_SECONDS - projected);
  return (
    <Card className="space-y-2">
      <div className="flex items-end justify-between text-sm">
        <span className="text-gray-700">
          ลงแล้ววันนี้ <b className="text-gray-900">{formatDuration(logged)}</b>
          {projected > logged && (
            <span className="text-brand-600"> (+{formatDuration(projected - logged)} ที่ร่าง)</span>
          )}
        </span>
        <span className="text-gray-500">เป้าหมาย 8h</span>
      </div>
      <ProgressBar
        value={projected}
        max={WORKDAY_SECONDS}
        color={projected >= WORKDAY_SECONDS ? "success" : "warning"}
      />
      <div className="text-xs text-gray-500">
        {remaining === 0 ? "ครบ 8 ชั่วโมงแล้ว ✓" : `เหลืออีก ${formatDuration(remaining)} · ${pct}%`}
      </div>
    </Card>
  );
}
