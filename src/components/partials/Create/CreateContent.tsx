"use client";

import { useState } from "react";
import { Plus, PlusSquare, Sparkles, Trash2, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
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

  const [projectKey, setProjectKey] = useState("");
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
      projectKey: projectKey || projects?.[0]?.key || "",
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
        icon={<PlusSquare size={22} />}
      />

      {result && (
        <div className="flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          <Sparkles size={18} className="shrink-0" />
          <span className="flex-1">
            สร้างสำเร็จ! Story <b>{result.storyKey}</b>
            {result.subtaskKeys.length > 0 && <> · Sub-task {result.subtaskKeys.join(", ")}</>}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setResult(null)}>
            สร้างใหม่
          </Button>
        </div>
      )}

      <Card className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>โปรเจค</Label>
            <Select value={projectKey} onChange={(e) => setProjectKey(e.target.value)}>
              <option value="">— เลือกโปรเจค —</option>
              {projects?.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name} ({p.key})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>ผู้รับผิดชอบ</Label>
            <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">— ไม่ระบุ —</option>
              {users?.map((u) => (
                <option key={u.accountId} value={u.accountId}>
                  {u.displayName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>ความสำคัญ</Label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <FieldRow
          label="หัวข้อ Story"
          action={<AiButton loading={rewrite.isPending} onClick={onRewriteTitle} label="AI ปรับคำ" />}
        >
          <Input
            placeholder="เช่น พัฒนาหน้า login ใหม่"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </FieldRow>

        <FieldRow
          label="รายละเอียด"
          action={<AiButton loading={rewrite.isPending} onClick={onRewriteDesc} label="AI ช่วยเขียน" />}
        >
          <Textarea
            className="min-h-28"
            placeholder="อธิบายงานคร่าว ๆ แล้วให้ AI ขยายความให้"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FieldRow>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Sub-tasks</Label>
            <AiButton loading={suggest.isPending} onClick={onSuggest} label="AI แนะนำ Sub-task" />
          </div>
          <div className="space-y-2">
            {subtasks.map((st, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder={`Sub-task ${i + 1}`}
                  value={st}
                  onChange={(e) => setSubtask(i, e.target.value)}
                />
                <button
                  onClick={() => removeSubtask(i)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <Button variant="tertiary" size="sm" onClick={addSubtask} iconLeft={<Plus size={15} />}>
              เพิ่ม Sub-task
            </Button>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <Button
            onClick={onSubmit}
            loading={createStory.isPending}
            disabled={!summary.trim() || (!projectKey && !projects?.length)}
          >
            สร้างงาน
          </Button>
        </div>
      </Card>
    </div>
  );
}

function FieldRow({
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
      <div className="mb-1.5 flex items-center justify-between">
        <Label>{label}</Label>
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
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Wand2 size={13} />
      )}
      {label}
    </button>
  );
}
