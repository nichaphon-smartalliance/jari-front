"use client";

import { useMemo, useState } from "react";
import { PieChart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { useProjectStatus } from "@/hooks/jari";
import type { ProjectStatus } from "@/services/jari.service";

// ─── colors ───────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  "To Do": "#98a2b3",
  "In Progress": "#2e90fa",
  BLOCKED: "#f04438",
  "QA&TEST": "#f79009",
  Done: "#12b76a",
};
const CATEGORY_COLOR: Record<string, string> = {
  งานรอคุย: "#f04438",
  รอแก้ปัญหา: "#f79009",
  กำลังแก้ไข: "#2e90fa",
  รอเทส: "#eaaa08",
  รอทำ: "#98a2b3",
  กำลังทำ: "#2e90fa",
  ติดปัญหา: "#b42318",
  เสร็จ: "#12b76a",
};
const FALLBACK = ["#7f56d9", "#06aed4", "#ee46bc", "#85a300", "#6938ef", "#475467"];
const colorFor = (map: Record<string, string>, key: string, i: number) =>
  map[key] ?? FALLBACK[i % FALLBACK.length];

// ─── donut geometry ───────────────────────────────────────────────────────────
const C = 110; // center
function polar(r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}
function arc(rOut: number, rIn: number, start: number, end: number) {
  const large = end - start > 180 ? 1 : 0;
  const a = polar(rOut, end);
  const b = polar(rOut, start);
  const c = polar(rIn, start);
  const d = polar(rIn, end);
  return `M ${a.x} ${a.y} A ${rOut} ${rOut} 0 ${large} 0 ${b.x} ${b.y} L ${c.x} ${c.y} A ${rIn} ${rIn} 0 ${large} 1 ${d.x} ${d.y} Z`;
}

interface Seg {
  label: string;
  count: number;
  color: string;
  start: number;
  end: number;
}
function toSegments(items: { label: string; count: number; color: string }[]): Seg[] {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  let angle = 0;
  return items.map((it) => {
    const start = angle;
    const end = angle + (it.count / total) * 360;
    angle = end;
    return { ...it, start, end };
  });
}

/** A single ring of segments. Full-circle (single segment) renders as a stroked
 *  circle to avoid a degenerate 360° arc path. */
function Ring({
  segments,
  rOut,
  rIn,
  onClick,
  activeLabel,
}: {
  segments: Seg[];
  rOut: number;
  rIn: number;
  onClick?: (label: string) => void;
  activeLabel?: string | null;
}) {
  if (segments.length === 1) {
    const s = segments[0];
    return (
      <circle
        cx={C}
        cy={C}
        r={(rOut + rIn) / 2}
        fill="none"
        stroke={s.color}
        strokeWidth={rOut - rIn}
        className={onClick ? "cursor-pointer" : ""}
        onClick={() => onClick?.(s.label)}
      />
    );
  }
  return (
    <>
      {segments.map((s) => {
        const dim = activeLabel != null && activeLabel !== s.label;
        return (
          <path
            key={s.label}
            d={arc(rOut, rIn, s.start, s.end)}
            fill={s.color}
            opacity={dim ? 0.35 : 1}
            className={onClick ? "cursor-pointer transition-opacity" : ""}
            onClick={() => onClick?.(s.label)}
          >
            <title>{`${s.label}: ${s.count}`}</title>
          </path>
        );
      })}
    </>
  );
}

export default function ProjectStatusCard() {
  const { data, isLoading } = useProjectStatus();
  const projects = useMemo(() => data ?? [], [data]);
  const [projectKey, setProjectKey] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);

  const project: ProjectStatus | undefined =
    projects.find((p) => p.projectKey === projectKey) ?? projects[0];

  const outer = useMemo(
    () =>
      toSegments(
        (project?.storyStatuses ?? []).map((s, i) => ({
          label: s.status,
          count: s.count,
          color: colorFor(STATUS_COLOR, s.status, i),
        })),
      ),
    [project],
  );

  const activeStatus = project?.storyStatuses.find((s) => s.status === selected);
  const inner = useMemo(
    () =>
      toSegments(
        (activeStatus?.subtaskCategories ?? []).map((c, i) => ({
          label: c.category,
          count: c.count,
          color: colorFor(CATEGORY_COLOR, c.category, i),
        })),
      ),
    [activeStatus],
  );

  if (isLoading) {
    return (
      <Card>
        <div className="py-12 text-center text-sm text-gray-500">กำลังโหลด...</div>
      </Card>
    );
  }
  if (!project) {
    return (
      <Card>
        <div className="py-12 text-center text-sm text-gray-500">ยังไม่มีข้อมูลโปรเจค</div>
      </Card>
    );
  }

  const onPickProject = (key: string) => {
    setProjectKey(key);
    setSelected(null);
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <PieChart size={18} className="text-gray-400" /> สถานะโปรเจค (คลิกวงนอกเพื่อดู subtask)
        </h2>
        <Select
          value={project.projectKey}
          onChange={(e) => onPickProject(e.target.value)}
          className="h-9 w-auto"
        >
          {projects.map((p) => (
            <option key={p.projectKey} value={p.projectKey}>
              {p.projectName} ({p.projectKey})
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 grid items-center gap-6 sm:grid-cols-[220px_1fr]">
        {/* donut */}
        <svg viewBox="0 0 220 220" className="mx-auto w-[220px]">
          <Ring segments={outer} rOut={100} rIn={74} onClick={setSelected} activeLabel={selected} />
          {inner.length > 0 && <Ring segments={inner} rOut={68} rIn={46} />}
          {/* center label */}
          <text x={C} y={selected ? C - 6 : C - 2} textAnchor="middle" fontSize="13" fontWeight="600" fill="#101828">
            {selected ?? project.totalStories}
          </text>
          <text x={C} y={selected ? C + 12 : C + 16} textAnchor="middle" fontSize="10" fill="#667085">
            {selected
              ? `${activeStatus?.count ?? 0} story`
              : `story ทั้งหมด`}
          </text>
        </svg>

        {/* legends */}
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-xs font-medium text-gray-500">สถานะ Story (วงนอก)</div>
            <div className="flex flex-col gap-1.5">
              {outer.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSelected(selected === s.label ? null : s.label)}
                  className={`flex items-center justify-between rounded-md px-2 py-1 text-sm transition-colors hover:bg-gray-50 ${
                    selected === s.label ? "bg-gray-50 font-medium" : ""
                  }`}
                >
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                  <span className="text-gray-500">{s.count}</span>
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <div className="border-t border-gray-100 pt-3">
              <div className="mb-2 text-xs font-medium text-gray-500">
                subtask ของ “{selected}” (วงใน)
              </div>
              {inner.length === 0 ? (
                <div className="px-2 text-sm text-gray-400">ไม่มี subtask</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {inner.map((s) => (
                    <div key={s.label} className="flex items-center justify-between px-2 text-sm">
                      <span className="flex items-center gap-2 text-gray-700">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.label}
                      </span>
                      <span className="text-gray-500">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
