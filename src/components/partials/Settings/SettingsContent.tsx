"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Settings as SettingsIcon, TriangleAlert } from "lucide-react";
import { PageHeader, LoadingBlock, ErrorBlock } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { useJiraAccount, useUpdateJiraAccount } from "@/hooks/jari";
import { useAuth } from "@/context/auth";
import { apiErrorMessage } from "@/lib/api/client";

export default function SettingsContent() {
  const { updateSession } = useAuth();
  const { data: status, isLoading, isError } = useJiraAccount();
  const update = useUpdateJiraAccount();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Prefill the email with whatever is currently linked.
  useEffect(() => {
    if (status?.jiraEmail) setEmail(status.jiraEmail);
  }, [status?.jiraEmail]);

  if (isLoading) return <LoadingBlock />;
  if (isError) return <ErrorBlock />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      const res = await update.mutateAsync({ email: email.trim(), token: token.trim() });
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

      {status?.hasToken ? (
        <div className="flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-3">
          <CheckCircle2 className="shrink-0 text-success-600" size={20} />
          <div className="text-sm text-success-800">
            เชื่อมแล้วกับ <b>{status.displayName}</b>
            {status.jiraEmail && <span className="text-success-700"> ({status.jiraEmail})</span>} —
            worklog จะลงในชื่อนี้
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3">
          <TriangleAlert className="shrink-0 text-warning-600" size={20} />
          <div className="text-sm text-warning-800">
            ยังไม่ได้เชื่อมบัญชี Jira — จะลงเวลาไม่ได้จนกว่าจะใส่ email และ API token ด้านล่าง
          </div>
        </div>
      )}

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
              สร้าง token ได้ที่{" "}
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:underline"
              >
                id.atlassian.com → API tokens
              </a>{" "}
              แล้ววางที่นี่ ระบบจะตรวจสอบให้ว่าใช้งานได้ก่อนบันทึก
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
            disabled={!email.trim() || !token.trim()}
            iconLeft={!update.isPending && <KeyRound size={16} />}
          >
            บันทึกและเชื่อมบัญชี
          </Button>
        </form>
      </Card>
    </div>
  );
}
