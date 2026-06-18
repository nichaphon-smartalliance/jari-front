"use client";

import { useState } from "react";
import { Plus, PlusSquare, Sparkles, Trash2, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/common";
import {
  useCreateStory,
  useProjects,
  useRewriteText,
  useSuggestSubtasks,
  useUsers,
} from "@/hooks/jari";
import type { Priority } from "@/types/app/jira";

const PRIORITIES: Priority[] = ["Highest", "High", "Medium", "Low", "Lowest"];

export default function CreateContent() {
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const createStory = useCreateStory();
  const rewrite = useRewriteText();
  const suggest = useSuggestSubtasks();

  const [projectKey, setProjectKey] = useState("MTG");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([""]);
  const [result, setResult] = useState<{ storyKey: string; subtaskKeys: string[] } | null>(null);

  const setSubtask = (i: number, v: string) =>
    setSubtasks((s) => s.map((x, idx) => (idx === i ? v : x)));
  const addSubtask = () => setSubtasks((s) => [...s, ""]);
  const removeSubtask = (i: number) => setSubtasks((s) => s.filter((_, idx) => idx !== i));

  const onRewriteTitle = async () => {
    if (!summary.trim()) return;
    setSummary(await rewrite.mutateAsync({ raw: summary, kind: "title" }));
  };
  const onRewriteDesc = async () => {
    if (!description.trim()) return;
    setDescription(await rewrite.mutateAsync({ raw: description, kind: "description" }));
  };
  const onSuggest = async () => {
    if (!summary.trim()) return;
    const ideas = await suggest.mutateAsync({ title: summary, description });
    setSubtasks((s) => [...s.filter((x) => x.trim()), ...ideas]);
  };

  const onSubmit = async () => {
    const res = await createStory.mutateAsync({
      projectKey,
      summary,
      description,
      priority,
      assigneeAccountId: assignee || undefined,
      subtasks: subtasks.map((s) => s.trim()).filter(Boolean),
    });
    setResult(res);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="สร้าง Story & Sub-task"
        subtitle="สร้างงานเร็วกว่า Jira พร้อมผู้ช่วย AI"
        icon={<PlusSquare size={26} />}
      />

      {result && (
        <div className="alert alert-success">
          <Sparkles size={18} />
          <span>
            สร้างสำเร็จ! Story <b>{result.storyKey}</b>
            {result.subtaskKeys.length > 0 && (
              <> พร้อม Sub-task {result.subtaskKeys.join(", ")}</>
            )}
          </span>
          <button className="btn btn-sm" onClick={() => setResult(null)}>
            สร้างใหม่
          </button>
        </div>
      )}

      <div className="card bg-base-100 border-base-300 border shadow-sm">
        <div className="card-body gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="โปรเจค">
              <select
                className="select select-bordered w-full"
                value={projectKey}
                onChange={(e) => setProjectKey(e.target.value)}
              >
                {projects?.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ผู้รับผิดชอบ">
              <select
                className="select select-bordered w-full"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">— ไม่ระบุ —</option>
                {users?.map((u) => (
                  <option key={u.accountId} value={u.accountId}>
                    {u.displayName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ความสำคัญ">
              <select
                className="select select-bordered w-full"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="หัวข้อ Story" action={
            <AiButton loading={rewrite.isPending} onClick={onRewriteTitle} label="AI ปรับคำ" />
          }>
            <input
              className="input input-bordered w-full"
              placeholder="เช่น พัฒนาหน้า login ใหม่"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </Field>

          <Field label="รายละเอียด" action={
            <AiButton loading={rewrite.isPending} onClick={onRewriteDesc} label="AI ช่วยเขียน" />
          }>
            <textarea
              className="textarea textarea-bordered min-h-28 w-full"
              placeholder="อธิบายงานคร่าว ๆ แล้วให้ AI ขยายความให้"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="label-text font-medium">Sub-tasks</label>
              <AiButton loading={suggest.isPending} onClick={onSuggest} label="AI แนะนำ Sub-task" />
            </div>
            <div className="space-y-2">
              {subtasks.map((st, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input input-bordered input-sm w-full"
                    placeholder={`Sub-task ${i + 1}`}
                    value={st}
                    onChange={(e) => setSubtask(i, e.target.value)}
                  />
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error"
                    onClick={() => removeSubtask(i)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm gap-1" onClick={addSubtask}>
                <Plus size={15} /> เพิ่ม Sub-task
              </button>
            </div>
          </div>

          <div className="card-actions justify-end pt-2">
            <button
              className="btn btn-primary gap-1"
              disabled={!summary.trim() || createStory.isPending}
              onClick={onSubmit}
            >
              {createStory.isPending && <span className="loading loading-spinner loading-xs" />}
              สร้างงาน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="label-text font-medium">{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

function AiButton({
  loading,
  onClick,
  label,
}: {
  loading: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button className="btn btn-ghost btn-xs text-primary gap-1" onClick={onClick} disabled={loading}>
      {loading ? <span className="loading loading-spinner loading-xs" /> : <Wand2 size={13} />}
      {label}
    </button>
  );
}
