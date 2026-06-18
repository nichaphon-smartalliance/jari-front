"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Timer } from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from "@/components/common";
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
        icon={<Timer size={26} />}
        actions={
          list.length > 0 ? (
            <button className="btn btn-secondary btn-sm gap-1" onClick={onAiFill} disabled={plan.isPending}>
              {plan.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Sparkles size={16} />
              )}
              AI ลงเวลาให้ครบ 8 ชม.
            </button>
          ) : undefined
        }
      />

      <ProgressCard logged={loggedSeconds} projected={projected} />

      {list.length === 0 ? (
        <EmptyBlock label="ไม่มี Sub-task ที่ Done ค้างลงเวลา 🎉" icon={<CheckCircle2 size={36} />} />
      ) : (
        <>
          <div className="space-y-3">
            {list.map((issue) => {
              const d = drafts[issue.key] ?? { timeSpent: "", comment: "" };
              return (
                <div key={issue.key} className="card bg-base-100 border-base-300 border shadow-sm">
                  <div className="card-body gap-3 p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base-content/50 font-mono text-xs">{issue.key}</span>
                      <span className="badge badge-success badge-xs">Done</span>
                      {issue.parentKey && (
                        <span className="text-base-content/40 text-xs">↳ {issue.parentKey}</span>
                      )}
                    </div>
                    <div className="font-medium">{issue.summary}</div>
                    <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                      <input
                        className="input input-bordered input-sm"
                        placeholder="เช่น 3h 30m"
                        value={d.timeSpent}
                        onChange={(e) => setDraft(issue.key, { timeSpent: e.target.value })}
                      />
                      <input
                        className="input input-bordered input-sm"
                        placeholder="คอมเมนต์ (อะไรที่ทำไป)"
                        value={d.comment}
                        onChange={(e) => setDraft(issue.key, { comment: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3">
            <span className="text-base-content/60 text-sm">
              จะลงเวลารวม {formatDuration(draftSeconds)}
            </span>
            <button
              className="btn btn-primary gap-1"
              onClick={onSubmitAll}
              disabled={submitting || draftSeconds === 0}
            >
              {submitting && <span className="loading loading-spinner loading-xs" />}
              ลงเวลาทั้งหมด
            </button>
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
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body gap-2 p-4">
        <div className="flex items-end justify-between text-sm">
          <span>
            ลงแล้ววันนี้ <b>{formatDuration(logged)}</b>
            {projected > logged && (
              <span className="text-secondary"> (+{formatDuration(projected - logged)} ที่ร่าง)</span>
            )}
          </span>
          <span className="text-base-content/60">เป้าหมาย 8h</span>
        </div>
        <progress
          className={`progress w-full ${projected >= WORKDAY_SECONDS ? "progress-success" : "progress-warning"}`}
          value={projected}
          max={WORKDAY_SECONDS}
        />
        <div className="text-base-content/60 text-xs">
          {remaining === 0 ? "ครบ 8 ชั่วโมงแล้ว ✓" : `เหลืออีก ${formatDuration(remaining)} · ${pct}%`}
        </div>
      </div>
    </div>
  );
}
