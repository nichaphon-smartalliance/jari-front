"use client";

import { useMemo } from "react";
import { LineChart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useSprintTimeline } from "@/hooks/jari";

// Distinct, color-blind-friendly-ish palette for the per-person lines.
const PALETTE = [
  "#7f56d9", "#2e90fa", "#12b76a", "#f79009", "#f04438",
  "#ee46bc", "#06aed4", "#85a300", "#6938ef", "#475467",
];

const W = 720;
const H = 280;
const PAD = { left: 36, right: 12, top: 14, bottom: 30 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

export default function TimelineCard() {
  const { data, isLoading } = useSprintTimeline();

  const model = useMemo(() => {
    if (!data || data.days.length === 0) return null;
    const days = data.days;
    // cumulative per person, keep top 10 by final total
    const series = data.people
      .map((p, idx) => {
        let run = 0;
        const cum = p.daily.map((n) => (run += n));
        return { name: p.displayName, cum, total: run, color: PALETTE[idx % PALETTE.length] };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    const maxY = Math.max(1, ...series.map((s) => s.total));
    const x = (i: number) =>
      PAD.left + (days.length <= 1 ? PLOT_W / 2 : (i / (days.length - 1)) * PLOT_W);
    const y = (v: number) => PAD.top + PLOT_H - (v / maxY) * PLOT_H;
    return { days, series, maxY, x, y };
  }, [data]);

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <LineChart size={18} className="text-gray-400" /> Timeline — subtask ที่ปิดงานสะสมต่อคน (sprint นี้)
      </h2>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">กำลังโหลด...</div>
      ) : !model ? (
        <div className="py-12 text-center text-sm text-gray-500">ยังไม่มี subtask ที่ปิดใน sprint นี้</div>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img">
            {/* horizontal gridlines + y labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const val = Math.round(model.maxY * t);
              const yy = PAD.top + PLOT_H - t * PLOT_H;
              return (
                <g key={t}>
                  <line x1={PAD.left} y1={yy} x2={W - PAD.right} y2={yy} stroke="#eef0f3" />
                  <text x={PAD.left - 6} y={yy + 3} textAnchor="end" fontSize="10" fill="#98a2b3">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* x-axis day labels */}
            {model.days.map((d, i) => {
              const show = model.days.length <= 12 || i % 2 === 0;
              if (!show) return null;
              const [, mm, dd] = d.split("-");
              return (
                <text
                  key={d}
                  x={model.x(i)}
                  y={H - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#98a2b3"
                >
                  {dd}/{mm}
                </text>
              );
            })}

            {/* one line per person */}
            {model.series.map((s) => {
              const pts = s.cum.map((v, i) => `${model.x(i)},${model.y(v)}`).join(" ");
              return (
                <g key={s.name}>
                  <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" />
                  {s.cum.map((v, i) => (
                    <circle key={i} cx={model.x(i)} cy={model.y(v)} r="2.5" fill={s.color} />
                  ))}
                </g>
              );
            })}
          </svg>

          {/* legend */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {model.series.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} <b className="text-gray-900">{s.total}</b>
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
