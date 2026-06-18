"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock } from "@/components/common";
import { useDailyData } from "@/hooks/jari";
import { formatDuration, todayISO } from "@/lib/format";
import type { DailyPerson } from "@/types/app/jira";

const STATUS_META: Record<DailyPerson["status"], { cls: string; label: string }> = {
  under: { cls: "badge-error", label: "ยังไม่ครบ" },
  ok: { cls: "badge-success", label: "ครบ 8 ชม." },
  over: { cls: "badge-warning", label: "เกินเวลา" },
};

export default function DailyContent() {
  const [date, setDate] = useState(todayISO());
  const { data, isLoading, isError } = useDailyData(date);

  return (
    <div className="space-y-6">
      <PageHeader
        title="สรุปเวลาทำงานรายวัน"
        subtitle="ใครยังลงเวลาไม่ครบ 8 ชม. หรือเกิน และทำงานอะไรบ้าง"
        icon={<CalendarClock size={26} />}
        actions={
          <input
            type="date"
            className="input input-bordered input-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        }
      />

      {isLoading ? (
        <LoadingBlock />
      ) : isError || !data ? (
        <ErrorBlock />
      ) : (
        <>
          <Summary people={data.people} />
          <div className="grid gap-3 lg:grid-cols-2">
            {data.people.map((p) => (
              <PersonCard key={p.accountId} person={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Summary({ people }: { people: DailyPerson[] }) {
  const counts = {
    under: people.filter((p) => p.status === "under").length,
    ok: people.filter((p) => p.status === "ok").length,
    over: people.filter((p) => p.status === "over").length,
  };
  const items = [
    { label: "ยังไม่ครบ", value: counts.under, cls: "text-error" },
    { label: "ครบพอดี", value: counts.ok, cls: "text-success" },
    { label: "เกินเวลา", value: counts.over, cls: "text-warning" },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.label} className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body items-center p-4">
            <div className={`text-3xl font-bold ${it.cls}`}>{it.value}</div>
            <div className="text-base-content/60 text-xs">{it.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PersonCard({ person }: { person: DailyPerson }) {
  const meta = STATUS_META[person.status];
  return (
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{person.displayName}</span>
          <span className={`badge ${meta.cls} badge-sm`}>{meta.label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{formatDuration(person.totalSeconds)}</span>
          <span className="text-base-content/50 text-sm">/ 8h</span>
        </div>
        <progress
          className={`progress w-full ${
            person.status === "under"
              ? "progress-error"
              : person.status === "over"
                ? "progress-warning"
                : "progress-success"
          }`}
          value={person.totalSeconds}
          max={person.targetSeconds}
        />
        {person.entries.length > 0 ? (
          <ul className="divide-base-300 divide-y text-sm">
            {person.entries.map((e) => (
              <li key={e.issueKey} className="flex items-center justify-between py-1.5">
                <span className="min-w-0 truncate">
                  <span className="text-base-content/50 font-mono text-xs">{e.issueKey}</span>{" "}
                  {e.issueSummary}
                </span>
                <span className="text-base-content/70 ml-2 shrink-0">{e.hours}h</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-base-content/40 text-sm">ยังไม่ได้ลงเวลาวันนี้</div>
        )}
      </div>
    </div>
  );
}
