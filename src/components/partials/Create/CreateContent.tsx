"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ListChecks,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import {
  useCreateStory,
  useDraftStory,
  useEpics,
  useProjects,
  useRewriteText,
  useSuggestSubtasks,
  useUsers,
} from "@/hooks/jari";
import type { Priority } from "@/types/app/jira";

const PRIORITIES: Priority[] = ["Highest", "High", "Medium", "Low", "Lowest"];

const EXAMPLES = [
  "ทำหน้า login ใหม่ให้รองรับ Google และ remember me",
  "ระบบแจ้งเตือนเมื่อ worklog ไม่ครบ 8 ชั่วโมงต่อวัน",
  "ปรับ dashboard ให้โหลดเร็วขึ้นและแสดงสุขภาพ sprint",
];

type Phase = "brief" | "review";

export default function CreateContent() {
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const createStory = useCreateStory();
  const draft = useDraftStory();
  const rewrite = useRewriteText();
  const suggest = useSuggestSubtasks();

  const [phase, setPhase] = useState<Phase>("brief");
  const [brief, setBrief] = useState("");

  const [projectKey, setProjectKey] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [epicKey, setEpicKey] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([""]);
  const [result, setResult] = useState<{ storyKey: string; subtaskKeys: string[] } | null>(null);

  const effectiveProjectKey = projectKey || projects?.[0]?.key || "";
  const { data: epics } = useEpics(effectiveProjectKey);

  const setSubtask = (i: number, v: string) =>
    setSubtasks((s) => s.map((x, idx) => (idx === i ? v : x)));
  const addSubtask = () => setSubtasks((s) => [...s, ""]);
  const removeSubtask = (i: number) => setSubtasks((s) => s.filter((_, idx) => idx !== i));

  const onGenerate = async () => {
    if (!brief.trim()) return;
    const d = await draft.mutateAsync({ brief });
    setSummary(d.title);
    setDescription(d.description);
    setSubtasks(d.subtasks.length ? d.subtasks : [""]);
    setResult(null);
    setPhase("review");
  };

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

  const startOver = () => {
    setPhase("brief");
    setResult(null);
  };

  const onSubmit = async () => {
    const res = await createStory.mutateAsync({
      projectKey: effectiveProjectKey,
      summary,
      description,
      priority,
      assigneeAccountId: assignee || undefined,
      epicKey: epicKey || undefined,
      subtasks: subtasks.map((s) => s.trim()).filter(Boolean),
    });
    setResult(res);
  };

  // ── Phase 1: one clean box, tell the AI what you want to build ──────────────
  if (phase === "brief") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-10 text-center sm:py-16">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/25">
          <Sparkles size={26} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          เล่างานที่อยากสร้าง แล้วให้ AI จัดการที่เหลือ
        </h1>
        <p className="mt-2.5 max-w-md text-sm text-gray-600">
          พิมพ์เล่าคร่าว ๆ ว่าจะทำอะไร AI จะร่าง <b>หัวข้อ</b>, <b>รายละเอียด</b> และ{" "}
          <b>Sub-task</b> ให้พร้อมสร้าง — คุณแค่ตรวจและเลือกบอร์ดนิดหน่อย
        </p>

        <div className="mt-7 w-full">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-900/5 transition-shadow focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100">
            <Textarea
              autoFocus
              className="min-h-36 resize-none border-0 bg-transparent text-base shadow-none focus:ring-0"
              placeholder="เช่น อยากทำหน้าโปรไฟล์ผู้ใช้ใหม่ ให้แก้ไขรูป ชื่อ อีเมล และเปลี่ยนรหัสผ่านได้ พร้อม validate ฟอร์ม..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onGenerate();
              }}
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-1">
              <span className="text-xs text-gray-400">⌘/Ctrl + Enter เพื่อสร้าง</span>
              <Button
                onClick={onGenerate}
                loading={draft.isPending}
                disabled={!brief.trim()}
                iconLeft={<Sparkles size={16} />}
              >
                สร้างด้วย AI
              </Button>
            </div>
          </div>

          {draft.isError && (
            <p className="mt-3 text-sm text-error-600">
              สร้างไม่สำเร็จ — ลองเล่ารายละเอียดเพิ่มแล้วลองใหม่อีกครั้ง
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-gray-400">ลองตัวอย่าง:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setBrief(ex)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 2: review the AI draft + light metadata, then create ─────────────
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={startOver}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          เล่าใหม่
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <Sparkles size={13} />
          AI ร่างให้แล้ว · ตรวจแล้วกดสร้าง
        </span>
      </div>

      {result && (
        <div className="flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="flex-1">
            สร้างสำเร็จ! Story <b>{result.storyKey}</b>
            {result.subtaskKeys.length > 0 && <> · Sub-task {result.subtaskKeys.join(", ")}</>}
          </span>
          <Button variant="secondary" size="sm" onClick={startOver}>
            สร้างใหม่
          </Button>
        </div>
      )}

      {/* Light metadata — board, owner, priority, epic */}
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>โปรเจค / บอร์ด</Label>
            <Select
              value={projectKey}
              onChange={(e) => {
                setProjectKey(e.target.value);
                setEpicKey("");
              }}
            >
              <option value="">{projects?.[0] ? `${projects[0].name} (${projects[0].key})` : "— เลือกโปรเจค —"}</option>
              {projects?.slice(1).map((p) => (
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
          <div>
            <Label>Epic {epics && epics.length === 0 ? "(ไม่มี)" : "(ไม่บังคับ)"}</Label>
            <Select
              value={epicKey}
              onChange={(e) => setEpicKey(e.target.value)}
              disabled={!epics?.length}
            >
              <option value="">— ไม่ผูก Epic —</option>
              {epics?.map((ep) => (
                <option key={ep.key} value={ep.key}>
                  {ep.summary} ({ep.key})
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* The AI draft — fully editable */}
      <Card className="space-y-5">
        <FieldRow
          label="หัวข้อ Story"
          action={<AiButton loading={rewrite.isPending} onClick={onRewriteTitle} label="ปรับคำ" />}
        >
          <Input
            placeholder="หัวข้องาน"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </FieldRow>

        <FieldRow
          label="รายละเอียด"
          action={<AiButton loading={rewrite.isPending} onClick={onRewriteDesc} label="ช่วยเขียน" />}
        >
          <Textarea
            className="min-h-36"
            placeholder="รายละเอียดงาน"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FieldRow>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>
              <span className="inline-flex items-center gap-1.5">
                <ListChecks size={15} className="text-gray-400" />
                Sub-tasks
              </span>
            </Label>
            <AiButton loading={suggest.isPending} onClick={onSuggest} label="แนะนำเพิ่ม" />
          </div>
          <div className="space-y-2">
            {subtasks.map((st, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gray-100 text-xs font-semibold text-gray-500">
                  {i + 1}
                </span>
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

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={startOver} iconLeft={<ArrowLeft size={16} />}>
            เล่าใหม่
          </Button>
          <Button
            onClick={onSubmit}
            loading={createStory.isPending}
            disabled={!summary.trim() || !effectiveProjectKey}
            iconRight={<ArrowRight size={16} />}
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
