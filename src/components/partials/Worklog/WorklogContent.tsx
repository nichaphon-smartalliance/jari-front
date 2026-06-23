"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, CalendarDays, CheckCircle2, Settings, Sparkles, Timer } from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/Feedback";
import {
  useBackfillWorklogs,
  useCreateWorklog,
  useDailyData,
  usePlanWorklogs,
  useWorklogCandidates,
} from "@/hooks/jari";
import { useAuth } from "@/context/auth";
import { apiErrorMessage } from "@/lib/api/client";
import { WORKDAY_SECONDS, formatDuration, localDateISO, parseDuration } from "@/lib/format";
import type { BackfillPlanItem } from "@/services/ai.service";
import BackfillPreview, { type ConfirmItem } from "./BackfillPreview";

interface Draft {
  timeSpent: string;
  comment: string;
}

export default function WorklogContent() {
  const maxDate = localDateISO(); // today (local) — no logging into the future
  const { user } = useAuth();
  const accountId = user?.accountId ?? "";
  const { data: candidates, isLoading, isError } = useWorklogCandidates(accountId);
  const plan = usePlanWorklogs();
  const backfill = useBackfillWorklogs();
  const createWorklog = useCreateWorklog();

  const [date, setDate] = useState(maxDate);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [backfillPlan, setBackfillPlan] = useState<BackfillPlanItem[] | null>(null);

  const { data: daily } = useDailyData(date);
  const isBackdated = date !== maxDate;

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
    setSubmitError("");
    try {
      const items = await plan.mutateAsync({ candidates: list, alreadyLoggedSeconds: loggedSeconds });
      const next: Record<string, Draft> = {};
      for (const it of items) next[it.issueKey] = { timeSpent: it.timeSpent, comment: it.comment };
      setDrafts(next);
    } catch (err) {
      setSubmitError(apiErrorMessage(err, "AI ลงเวลาให้ไม่สำเร็จ ลองอีกครั้ง"));
    }
  };

  const onSubmitAll = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      for (const issue of list) {
        const d = drafts[issue.key];
        const seconds = parseDuration(d?.timeSpent || "");
        if (seconds > 0) {
          await createWorklog.mutateAsync({
            issueKey: issue.key,
            seconds,
            comment: d.comment,
            date,
          });
        }
      }
      setDrafts({});
    } catch (err) {
      setSubmitError(apiErrorMessage(err, "ลงเวลาไม่สำเร็จ ลองอีกครั้ง"));
    } finally {
      setSubmitting(false);
    }
  };

  // AI spreads the whole backlog across past workdays → opens an editable preview.
  const onBackfill = async () => {
    setSubmitError("");
    try {
      const items = await backfill.mutateAsync({ candidates: list, accountId, startDate: date });
      setBackfillPlan(items);
    } catch (err) {
      setSubmitError(apiErrorMessage(err, "AI ไล่ลงย้อนหลังไม่สำเร็จ ลองอีกครั้ง"));
    }
  };

  const onConfirmBackfill = async (items: ConfirmItem[]) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      for (const it of items) {
        await createWorklog.mutateAsync({
          issueKey: it.issueKey,
          seconds: it.seconds,
          comment: it.comment,
          date: it.date,
        });
      }
      setBackfillPlan(null);
    } catch (err) {
      setSubmitError(apiErrorMessage(err, "ลงเวลาไม่สำเร็จ ลองอีกครั้ง"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ลงเวลางาน (Worklog)"
        subtitle={`${user?.displayName ?? ""} — ดึง Sub-task ที่ Done แต่ยังไม่ลงเวลา`}
        icon={<Timer size={22} />}
        actions={
          backfillPlan ? undefined : (
            <>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays size={16} className="text-gray-400" />
                <input
                  type="date"
                  value={date}
                  max={maxDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDate(v && v <= maxDate ? v : maxDate);
                  }}
                  className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-xs focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-100"
                />
              </label>
              {list.length > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={onBackfill}
                    loading={backfill.isPending}
                    iconLeft={!backfill.isPending && <CalendarClock size={16} />}
                  >
                    AI ไล่ลงย้อนหลัง
                  </Button>
                  <Button
                    size="sm"
                    onClick={onAiFill}
                    loading={plan.isPending}
                    iconLeft={!plan.isPending && <Sparkles size={16} />}
                  >
                    AI ลงเวลาให้ครบ 8 ชม.
                  </Button>
                </>
              )}
            </>
          )
        }
      />

      {backfillPlan ? (
        <BackfillPreview
          plan={backfillPlan}
          submitting={submitting}
          error={submitError}
          onCancel={() => {
            setBackfillPlan(null);
            setSubmitError("");
          }}
          onConfirm={onConfirmBackfill}
        />
      ) : (
        <>
          {isBackdated && (
            <div className="flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-4 py-2.5 text-sm text-warning-800">
              <CalendarDays size={16} className="shrink-0 text-warning-600" />
              กำลังลงเวลา<b>ย้อนหลัง</b>ของวันที่ {date}
            </div>
          )}

          <ProgressCard logged={loggedSeconds} projected={projected} date={date} isToday={!isBackdated} />

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

          {/* Floating action bar — stays reachable at the bottom of the screen
              even when the candidate list is long, so you don't scroll to submit. */}
          <div className="sticky bottom-4 z-20 space-y-2">
            {submitError && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error-200 bg-error-50/95 px-4 py-3 text-sm text-error-700 shadow-lg backdrop-blur">
                <span>{submitError}</span>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1.5 font-semibold text-error-700 hover:underline"
                >
                  <Settings size={15} /> ไปที่ตั้งค่าบัญชี
                </Link>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <span className="text-sm text-gray-600">
                จะลงเวลารวม <b className="text-gray-900">{formatDuration(draftSeconds)}</b>
                <span className="text-gray-400"> · วันที่ {date}</span>
              </span>
              <Button onClick={onSubmitAll} loading={submitting} disabled={draftSeconds === 0}>
                ลงเวลาทั้งหมด
              </Button>
            </div>
          </div>
        </>
      )}
        </>
      )}
    </div>
  );
}

function ProgressCard({
  logged,
  projected,
  date,
  isToday,
}: {
  logged: number;
  projected: number;
  date: string;
  isToday: boolean;
}) {
  const pct = Math.min(100, Math.round((projected / WORKDAY_SECONDS) * 100));
  const remaining = Math.max(0, WORKDAY_SECONDS - projected);
  return (
    <Card className="space-y-2">
      <div className="flex items-end justify-between text-sm">
        <span className="text-gray-700">
          {isToday ? "ลงแล้ววันนี้" : `ลงแล้ววันที่ ${date}`}{" "}
          <b className="text-gray-900">{formatDuration(logged)}</b>
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
