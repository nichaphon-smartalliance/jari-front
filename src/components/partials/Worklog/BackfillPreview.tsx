"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { WORKDAY_SECONDS, formatDuration, parseDuration } from "@/lib/format";
import type { BackfillPlanItem } from "@/services/ai.service";

interface Row extends BackfillPlanItem {
  removed: boolean;
}

export interface ConfirmItem {
  issueKey: string;
  date: string;
  seconds: number;
  comment: string;
}

export default function BackfillPreview({
  plan,
  submitting,
  error,
  onCancel,
  onConfirm,
}: {
  plan: BackfillPlanItem[];
  submitting: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: (items: ConfirmItem[]) => void;
}) {
  const [rows, setRows] = useState<Row[]>(() => plan.map((p) => ({ ...p, removed: false })));
  useEffect(() => setRows(plan.map((p) => ({ ...p, removed: false }))), [plan]);

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  // active rows grouped by date, newest first
  const days = useMemo(() => {
    const map = new Map<string, { idx: number; row: Row }[]>();
    rows.forEach((row, idx) => {
      if (row.removed) return;
      const arr = map.get(row.date) ?? [];
      arr.push({ idx, row });
      map.set(row.date, arr);
    });
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [rows]);

  const grandTotal = rows.reduce(
    (s, r) => (r.removed ? s : s + parseDuration(r.timeSpent || "")),
    0,
  );

  const confirm = () =>
    onConfirm(
      rows
        .filter((r) => !r.removed)
        .map((r) => ({
          issueKey: r.issueKey,
          date: r.date,
          seconds: parseDuration(r.timeSpent || ""),
          comment: r.comment,
        }))
        .filter((it) => it.seconds > 0),
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
        <CalendarClock size={16} className="shrink-0 text-brand-600" />
        AI ไล่ลงให้แล้ว — ตรวจ/แก้ก่อนยืนยัน ({days.length} วัน · รวม {formatDuration(grandTotal)})
      </div>

      {days.map(([date, entries]) => {
        const dayTotal = entries.reduce((s, e) => s + parseDuration(e.row.timeSpent || ""), 0);
        const dow = new Date(`${date}T12:00:00Z`).toLocaleDateString("th-TH", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
        return (
          <Card key={date} padded={false}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
              <span className="text-sm font-semibold text-gray-900">
                {date} <span className="font-normal text-gray-400">· {dow}</span>
              </span>
              <span
                className={`text-xs font-medium ${
                  dayTotal >= WORKDAY_SECONDS ? "text-success-700" : "text-warning-700"
                }`}
              >
                {formatDuration(dayTotal)} / 8h
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {entries.map(({ idx, row }) => (
                <div key={row.issueKey} className="space-y-2 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">{row.issueKey}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                      {row.issueSummary}
                    </span>
                    <div className="w-24 shrink-0">
                      <Input
                        value={row.timeSpent}
                        onChange={(e) => update(idx, { timeSpent: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => update(idx, { removed: true })}
                      className="shrink-0 text-gray-400 transition-colors hover:text-error-600"
                      title="เอาออก"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Input
                    placeholder="คอมเมนต์"
                    value={row.comment}
                    onChange={(e) => update(idx, { comment: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      <div className="sticky bottom-4 z-20 space-y-2">
        {error && (
          <div className="rounded-xl border border-error-200 bg-error-50/95 px-4 py-3 text-sm text-error-700 shadow-lg backdrop-blur">
            {error}
          </div>
        )}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <span className="text-sm text-gray-600">
            รวม <b className="text-gray-900">{formatDuration(grandTotal)}</b> · {days.length} วัน
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={submitting}>
              ยกเลิก
            </Button>
            <Button onClick={confirm} loading={submitting} disabled={grandTotal === 0}>
              ยืนยันลงทั้งหมด
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
