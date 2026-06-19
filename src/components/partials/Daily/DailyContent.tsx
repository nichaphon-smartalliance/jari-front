"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock } from "@/components/common";
import { Badge, type BadgeColor } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { ProgressBar, type ProgressColor } from "@/components/ui/Feedback";
import { Avatar } from "@/components/ui/Avatar";
import { useDailyData } from "@/hooks/jari";
import { formatDuration, todayISO } from "@/lib/format";
import type { DailyPerson } from "@/types/app/jira";

const STATUS_META: Record<
  DailyPerson["status"],
  { color: BadgeColor; bar: ProgressColor; label: string }
> = {
  under: { color: "error", bar: "error", label: "ยังไม่ครบ" },
  ok: { color: "success", bar: "success", label: "ครบ 8 ชม." },
  over: { color: "warning", bar: "warning", label: "เกินเวลา" },
};

export default function DailyContent() {
  const [date, setDate] = useState(todayISO());
  const { data, isLoading, isError } = useDailyData(date);

  return (
    <div className="space-y-6">
      <PageHeader
        title="สรุปเวลาทำงานรายวัน"
        subtitle="ใครยังลงเวลาไม่ครบ 8 ชม. หรือเกิน และทำงานอะไรบ้าง"
        icon={<CalendarClock size={22} />}
        actions={
          <Input
            type="date"
            className="!w-auto"
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
          <div className="grid gap-4 lg:grid-cols-2">
            {data.people.map((p) => (
              <PersonCard key={p.accountId} person={p} />
            ))}
            {data.people.length === 0 && (
              <Card className="text-center text-sm text-gray-500 lg:col-span-2">
                ยังไม่มีใครลงเวลาในวันนี้
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Summary({ people }: { people: DailyPerson[] }) {
  const items = [
    { label: "ยังไม่ครบ", value: people.filter((p) => p.status === "under").length, cls: "text-error-600" },
    { label: "ครบพอดี", value: people.filter((p) => p.status === "ok").length, cls: "text-success-600" },
    { label: "เกินเวลา", value: people.filter((p) => p.status === "over").length, cls: "text-warning-600" },
  ];
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((it) => (
        <Card key={it.label} className="flex flex-col items-center">
          <div className={`text-3xl font-semibold ${it.cls}`}>{it.value}</div>
          <div className="mt-1 text-xs text-gray-500">{it.label}</div>
        </Card>
      ))}
    </div>
  );
}

function PersonCard({ person }: { person: DailyPerson }) {
  const meta = STATUS_META[person.status];
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={person.displayName} size={36} />
          <span className="font-semibold text-gray-900">{person.displayName}</span>
        </div>
        <Badge color={meta.color} dot>
          {meta.label}
        </Badge>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-gray-900">
          {formatDuration(person.totalSeconds)}
        </span>
        <span className="text-sm text-gray-400">/ 8h</span>
      </div>
      <ProgressBar value={person.totalSeconds} max={person.targetSeconds} color={meta.bar} />
      {person.entries.length > 0 ? (
        <ul className="divide-y divide-gray-100 text-sm">
          {person.entries.map((e) => (
            <li key={e.issueKey} className="flex items-center justify-between py-1.5">
              <span className="min-w-0 truncate text-gray-700">
                <span className="font-mono text-xs text-gray-500">{e.issueKey}</span>{" "}
                {e.issueSummary}
              </span>
              <span className="ml-2 shrink-0 font-medium text-gray-600">{e.hours}h</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-400">ยังไม่ได้ลงเวลาวันนี้</div>
      )}
    </Card>
  );
}
