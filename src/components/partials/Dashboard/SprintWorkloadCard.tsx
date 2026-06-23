"use client";

import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useSprintWorkload } from "@/hooks/jari";

export default function SprintWorkloadCard() {
  const { data, isLoading } = useSprintWorkload();
  const people = data ?? [];

  return (
    <Card padded={false}>
      <h2 className="flex items-center gap-2 border-b border-gray-200 p-5 text-sm font-semibold text-gray-900">
        <Users size={18} className="text-gray-400" /> Workload — sprint นี้ (นับเป็น subtask)
      </h2>

      {isLoading ? (
        <div className="p-5 text-sm text-gray-500">กำลังโหลด...</div>
      ) : people.length === 0 ? (
        <div className="p-5 text-sm text-gray-500">ไม่มีงานใน sprint ที่เปิดอยู่</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                <th className="px-5 py-2.5 text-left">สมาชิก</th>
                <th className="px-3 py-2.5 text-center">รอทำ</th>
                <th className="px-3 py-2.5 text-center">เสร็จ</th>
                <th className="px-3 py-2.5 text-center">ทั้งหมด</th>
                <th className="w-40 px-5 py-2.5 text-left">ความคืบหน้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {people.map((p) => {
                const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
                return (
                  <tr key={p.accountId} className="hover:bg-gray-50">
                    <td className="px-5 py-2.5 font-medium text-gray-900">{p.displayName}</td>
                    <td className="px-3 py-2.5 text-center text-gray-600">{p.waiting}</td>
                    <td className="px-3 py-2.5 text-center font-medium text-success-700">{p.done}</td>
                    <td className="px-3 py-2.5 text-center text-gray-900">{p.total}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-success-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-xs text-gray-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
