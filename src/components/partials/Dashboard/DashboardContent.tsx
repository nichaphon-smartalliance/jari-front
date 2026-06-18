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
import { useDashboard } from "@/hooks/jari";
import type { DashboardData } from "@/types/app/jira";

export default function DashboardContent() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) return <LoadingBlock />;
  if (isError || !data) return <ErrorBlock />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ภาพรวม Sprint & Performance"
        subtitle="สุขภาพของ sprint ปัจจุบันและประสิทธิภาพของทีม"
        icon={<LayoutDashboard size={26} />}
      />
      <KpiRow data={data} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TrendCard data={data} />
        <SprintCard data={data} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <WorkloadCard data={data} />
        <ProjectsCard data={data} />
      </div>
    </div>
  );
}

function KpiRow({ data }: { data: DashboardData }) {
  const k = data.kpis;
  const items = [
    { label: "งานทั้งหมด", value: k.totalIssues, icon: Activity, cls: "text-info" },
    { label: "เสร็จแล้ว", value: k.completed, icon: CheckCircle2, cls: "text-success" },
    { label: "กำลังทำ", value: k.inProgress, icon: Clock, cls: "text-warning" },
    { label: "เกินกำหนด/บล็อก", value: k.blockedOrOverdue, icon: AlertTriangle, cls: "text-error" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body flex-row items-center justify-between p-4">
            <div>
              <div className="text-base-content/60 text-xs">{it.label}</div>
              <div className="text-3xl font-bold">{it.value}</div>
            </div>
            <it.icon className={it.cls} size={28} />
          </div>
        </div>
      ))}
      <div className="card bg-primary text-primary-content sm:col-span-2 lg:col-span-4">
        <div className="card-body flex-row items-center justify-around gap-4 p-4">
          <Gauge label="อัตราเสร็จงาน" value={k.completionRate} />
          <div className="bg-primary-content/20 h-12 w-px" />
          <Gauge label="อัตราตรงเวลา" value={k.onTimeRate} />
        </div>
      </div>
    </div>
  );
}

function Gauge({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="radial-progress"
        style={{ "--value": value, "--size": "3.5rem" } as React.CSSProperties}
        role="progressbar"
      >
        {value}%
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function TrendCard({ data }: { data: DashboardData }) {
  const max = Math.max(...data.trend.flatMap((t) => [t.created, t.completed]));
  return (
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-base">
          <TrendingUp size={18} /> งานที่สร้าง vs งานที่เสร็จ (6 เดือน)
        </h2>
        <div className="flex h-44 items-end justify-between gap-2 pt-4">
          {data.trend.map((t) => (
            <div key={t.month} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-36 w-full items-end justify-center gap-1">
                <div
                  className="bg-info/50 w-1/2 rounded-t-lg transition-all"
                  style={{ height: `${(t.created / max) * 100}%` }}
                  title={`สร้าง ${t.created}`}
                />
                <div
                  className="bg-success w-1/2 rounded-t-lg transition-all"
                  style={{ height: `${(t.completed / max) * 100}%` }}
                  title={`เสร็จ ${t.completed}`}
                />
              </div>
              <span className="text-base-content/60 text-xs">{t.month}</span>
            </div>
          ))}
        </div>
        <div className="text-base-content/60 flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="bg-info/40 inline-block h-2 w-3 rounded" /> สร้าง
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-success inline-block h-2 w-3 rounded" /> เสร็จ
          </span>
        </div>
      </div>
    </div>
  );
}

function SprintCard({ data }: { data: DashboardData }) {
  const s = data.sprint;
  const rows = [
    { label: "Committed", value: s.committed, max: s.committed, cls: "progress-info" },
    { label: "Completed", value: s.completed, max: s.committed, cls: "progress-success" },
    { label: "Carryover", value: s.carryover, max: s.committed, cls: "progress-warning" },
  ];
  return (
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-base">{s.name} — ความคืบหน้า</h2>
        <div className="space-y-3 pt-2">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{r.label}</span>
                <span className="font-semibold">{r.value}</span>
              </div>
              <progress className={`progress ${r.cls} w-full`} value={r.value} max={r.max} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkloadCard({ data }: { data: DashboardData }) {
  return (
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-base">ภาระงานของทีม</h2>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>สมาชิก</th>
                <th className="text-center">To Do</th>
                <th className="text-center">ทำอยู่</th>
                <th className="text-center">เสร็จ</th>
                <th className="text-right">วันนี้</th>
              </tr>
            </thead>
            <tbody>
              {data.workload.map((w) => (
                <tr key={w.accountId}>
                  <td className="font-medium">{w.displayName}</td>
                  <td className="text-center">{w.todo}</td>
                  <td className="text-center">{w.inProgress}</td>
                  <td className="text-center">{w.done}</td>
                  <td className="text-right">
                    <span
                      className={`badge badge-sm ${
                        w.loggedHoursToday >= 8
                          ? "badge-success"
                          : w.loggedHoursToday === 0
                            ? "badge-ghost"
                            : "badge-warning"
                      }`}
                    >
                      {w.loggedHoursToday}h
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProjectsCard({ data }: { data: DashboardData }) {
  return (
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-base">สุขภาพแต่ละโปรเจค</h2>
        <div className="space-y-4 pt-2">
          {data.projects.map((p) => (
            <div key={p.projectKey}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {p.projectName}{" "}
                  <span className="text-base-content/50">({p.projectKey})</span>
                </span>
                <span
                  className={`badge badge-sm ${
                    p.healthScore >= 70
                      ? "badge-success"
                      : p.healthScore >= 40
                        ? "badge-warning"
                        : "badge-error"
                  }`}
                >
                  {p.healthScore}
                </span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={p.done}
                max={p.total}
              />
              <div className="text-base-content/60 mt-0.5 text-xs">
                เสร็จ {p.done}/{p.total} · เกินกำหนด {p.overdue}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
