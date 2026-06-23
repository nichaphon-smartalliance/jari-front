"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock } from "@/components/common";
import { Card } from "@/components/ui/Card";
import { ProgressBar, RadialProgress } from "@/components/ui/Feedback";
import { useDashboard } from "@/hooks/jari";
import type { DashboardData } from "@/types/app/jira";
import SprintWorkloadCard from "./SprintWorkloadCard";
import TimelineCard from "./TimelineCard";
import ProjectStatusCard from "./ProjectStatusCard";

export default function DashboardContent() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) return <LoadingBlock />;
  if (isError || !data) return <ErrorBlock />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ภาพรวม Sprint & Performance"
        subtitle="สุขภาพของ sprint ปัจจุบันและประสิทธิภาพของทีม"
        icon={<LayoutDashboard size={22} />}
      />
      <KpiRow data={data} />
      <div className="grid gap-5 lg:grid-cols-3">
        <TrendCard data={data} />
        <RatesCard data={data} />
      </div>
      <SprintWorkloadCard />
      <TimelineCard />
      <ProjectStatusCard />
      <SprintCard data={data} />
    </div>
  );
}

function KpiRow({ data }: { data: DashboardData }) {
  const k = data.kpis;
  const items = [
    { label: "งานทั้งหมด", value: k.totalIssues, icon: Activity, tone: "bg-brand-50 text-brand-600" },
    { label: "เสร็จแล้ว", value: k.completed, icon: CheckCircle2, tone: "bg-success-50 text-success-600" },
    { label: "กำลังทำ", value: k.inProgress, icon: Clock, tone: "bg-blue-50 text-blue-600" },
    { label: "เกินกำหนด/บล็อก", value: k.blockedOrOverdue, icon: AlertTriangle, tone: "bg-error-50 text-error-600" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">{it.label}</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">{it.value}</div>
          </div>
          <span className={`grid h-11 w-11 place-items-center rounded-lg ${it.tone}`}>
            <it.icon size={22} />
          </span>
        </Card>
      ))}
    </div>
  );
}

function RatesCard({ data }: { data: DashboardData }) {
  const k = data.kpis;
  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-900">อัตราการทำงาน</h2>
      <div className="mt-4 flex items-center justify-around">
        <div className="flex flex-col items-center gap-2">
          <RadialProgress value={k.completionRate} barClass="text-brand-600" />
          <span className="text-xs font-medium text-gray-600">อัตราเสร็จงาน</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <RadialProgress value={k.onTimeRate} barClass="text-success-600" />
          <span className="text-xs font-medium text-gray-600">อัตราตรงเวลา</span>
        </div>
      </div>
    </Card>
  );
}

function TrendCard({ data }: { data: DashboardData }) {
  const max = Math.max(1, ...data.trend.flatMap((t) => [t.created, t.completed]));
  return (
    <Card className="lg:col-span-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <TrendingUp size={18} className="text-gray-400" /> งานที่สร้าง vs งานที่เสร็จ (6 เดือน)
      </h2>
      <div className="mt-5 flex h-44 items-end justify-between gap-3">
        {data.trend.map((t) => (
          <div key={t.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end justify-center gap-1.5">
              <div
                className="w-1/2 rounded-t-md bg-blue-200 transition-all"
                style={{ height: `${(t.created / max) * 100}%` }}
                title={`สร้าง ${t.created}`}
              />
              <div
                className="w-1/2 rounded-t-md bg-brand-600 transition-all"
                style={{ height: `${(t.completed / max) * 100}%` }}
                title={`เสร็จ ${t.completed}`}
              />
            </div>
            <span className="text-xs text-gray-500">{t.month}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 rounded bg-blue-200" /> สร้าง
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 rounded bg-brand-600" /> เสร็จ
        </span>
      </div>
    </Card>
  );
}

function SprintCard({ data }: { data: DashboardData }) {
  const s = data.sprint;
  const rows = [
    { label: "Committed", value: s.committed, color: "brand" as const },
    { label: "Completed", value: s.completed, color: "success" as const },
    { label: "Carryover", value: s.carryover, color: "warning" as const },
  ];
  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-900">{s.name} — ความคืบหน้า</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-gray-600">{r.label}</span>
              <span className="font-semibold text-gray-900">{r.value}</span>
            </div>
            <ProgressBar value={r.value} max={s.committed} color={r.color} />
          </div>
        ))}
      </div>
    </Card>
  );
}

