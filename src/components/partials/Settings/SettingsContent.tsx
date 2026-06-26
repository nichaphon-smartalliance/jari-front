"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  KeyRound,
  PlusCircle,
  Settings as SettingsIcon,
  TriangleAlert,
} from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { useJiraAccount, useUpdateJiraAccount } from "@/hooks/jari";
import { useAuth } from "@/context/auth";
import { apiErrorMessage } from "@/lib/api/client";

const ATLASSIAN_TOKEN_URL = "https://id.atlassian.com/manage-profile/security/api-tokens";

export default function SettingsContent() {
  const { updateSession } = useAuth();
  const { data: status, isLoading, isError } = useJiraAccount();
  const update = useUpdateJiraAccount();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);

  // Prefill with whatever is currently linked, and only show the "how to" guide
  // by default to people who haven't linked an account yet — returning users
  // already know the drill and just want the form.
  useEffect(() => {
    if (status?.jiraEmail) setEmail(status.jiraEmail);
    if (status?.tokenExpiresAt) setExpiresAt(status.tokenExpiresAt);
    if (status) setGuideOpen(!status.hasToken);
  }, [status?.jiraEmail, status?.tokenExpiresAt, status?.hasToken]);

  if (isLoading) return <LoadingBlock />;
  if (isError) return <ErrorBlock />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      const res = await update.mutateAsync({
        email: email.trim(),
        token: token.trim(),
        expiresAt: expiresAt.trim() || undefined,
      });
      updateSession(res.token, res.user);
      setToken("");
      setSaved(true);
    } catch (err) {
      setError(apiErrorMessage(err, "บันทึกไม่สำเร็จ — ตรวจสอบ email และ API token"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ตั้งค่าบัญชี Jira"
        subtitle="เชื่อมบัญชี Jira ของคุณเอง เพื่อให้เวลาที่ลงไปขึ้นชื่อคุณ ไม่ใช่บัญชีกลาง"
        icon={<SettingsIcon size={22} />}
      />

      <StatusBanner
        hasToken={!!status?.hasToken}
        expired={!!status?.tokenExpired}
        expiresAt={status?.tokenExpiresAt ?? null}
        displayName={status?.displayName}
        jiraEmail={status?.jiraEmail}
      />

      <Card padded={false} className="overflow-hidden">
        <button
          type="button"
          onClick={() => setGuideOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span className="text-sm font-semibold text-gray-900">
            วิธีสร้าง Jira API token (ทำครั้งเดียว)
          </span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-gray-400 transition-transform ${guideOpen ? "rotate-180" : ""}`}
          />
        </button>

        {guideOpen && (
          <div className="space-y-4 border-t border-gray-200 px-5 py-5">
            <GuideStep n={1} icon={<ExternalLink size={16} />}>
              เปิดหน้า{" "}
              <a
                href={ATLASSIAN_TOKEN_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:underline"
              >
                id.atlassian.com → API tokens
              </a>{" "}
              แล้วเข้าสู่ระบบด้วยบัญชี Jira ของคุณ (ถ้า Atlassian ส่งรหัสยืนยันไปที่อีเมล ให้กรอกรหัสนั้นก่อน)
            </GuideStep>
            <GuideStep n={2} icon={<PlusCircle size={16} />}>
              กดปุ่ม <b>Create API token</b>
            </GuideStep>
            <GuideStep n={3} icon={<KeyRound size={16} />}>
              ตั้งชื่อ token (เช่น <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">jari</code>)
              และเลือก <b>วันหมดอายุ</b> แล้วกด Create — <b>จดวันหมดอายุนี้ไว้</b> ต้องใส่ในฟอร์มด้านล่างด้วย
            </GuideStep>
            <GuideStep n={4} icon={<Copy size={16} />}>
              กด <b>Copy</b> เพื่อคัดลอก token — Atlassian ให้ดูได้ครั้งเดียวเท่านั้น ปิดหน้าต่างไปแล้วเรียกดูซ้ำไม่ได้
              ต้องสร้างใหม่
            </GuideStep>
            <GuideStep n={5} icon={<CheckCircle2 size={16} />} last>
              วาง <b>email</b>, <b>token</b> และ <b>วันหมดอายุ</b> ที่จดไว้ ลงในฟอร์มด้านล่าง แล้วกด
              &ldquo;บันทึกและเชื่อมบัญชี&rdquo;
            </GuideStep>

            <a
              href={ATLASSIAN_TOKEN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button type="button" variant="secondary" size="sm" iconLeft={<ExternalLink size={14} />}>
                เปิดหน้าสร้าง Token ของ Atlassian
              </Button>
            </a>
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Jira email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <Label>Jira API token</Label>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
              placeholder={status?.hasToken ? "วาง token ใหม่เพื่ออัปเดต" : "วาง API token ที่นี่"}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              คัดลอกมาจากขั้นตอนที่ 4 ด้านบน — token จะเห็นได้ครั้งเดียวตอนสร้างเท่านั้น
            </p>
          </div>
          <div>
            <Label>วันหมดอายุของ token</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              ใส่วันเดียวกับที่เลือกตอนสร้าง token ในขั้นตอนที่ 3 — Jari จะเตือนล่วงหน้าก่อน token หมดอายุ
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700">
              บันทึกและเชื่อมบัญชีสำเร็จ ✓
            </div>
          )}

          <Button
            type="submit"
            loading={update.isPending}
            disabled={!email.trim() || !token.trim() || !expiresAt.trim()}
            iconLeft={!update.isPending && <KeyRound size={16} />}
          >
            บันทึกและเชื่อมบัญชี
          </Button>
        </form>
      </Card>
    </div>
  );
}

function GuideStep({
  n,
  icon,
  last = false,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
          {n}
        </span>
        {!last && <span className="mt-1 w-px flex-1 bg-gray-200" />}
      </div>
      <div className="flex-1 pb-1">
        <div className="flex items-center gap-1.5 text-gray-400">{icon}</div>
        <p className="mt-1 text-sm leading-relaxed text-gray-700">{children}</p>
      </div>
    </div>
  );
}

function StatusBanner({
  hasToken,
  expired,
  expiresAt,
  displayName,
  jiraEmail,
}: {
  hasToken: boolean;
  expired: boolean;
  expiresAt: string | null;
  displayName?: string;
  jiraEmail?: string;
}) {
  if (!hasToken) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3">
        <TriangleAlert className="shrink-0 text-warning-600" size={20} />
        <div className="text-sm text-warning-800">
          ยังไม่ได้เชื่อมบัญชี Jira — จะลงเวลาไม่ได้จนกว่าจะใส่ email และ API token ด้านล่าง
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3">
        <TriangleAlert className="shrink-0 text-error-600" size={20} />
        <div className="text-sm text-error-800">
          API token หมดอายุไปแล้วเมื่อวันที่ <b>{expiresAt}</b> — สร้าง token ใหม่ตามขั้นตอนด้านล่าง แล้วบันทึกอีกครั้ง
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-3">
      <CheckCircle2 className="shrink-0 text-success-600" size={20} />
      <div className="text-sm text-success-800">
        เชื่อมแล้วกับ <b>{displayName}</b>
        {jiraEmail && <span className="text-success-700"> ({jiraEmail})</span>} — worklog จะลงในชื่อนี้
        {expiresAt && <span className="text-success-700"> · token หมดอายุ {expiresAt}</span>}
      </div>
    </div>
  );
}
