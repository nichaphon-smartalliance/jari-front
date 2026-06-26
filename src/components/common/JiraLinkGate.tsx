"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { KeyRound, TriangleAlert } from "lucide-react";
import PageHeader from "./PageHeader";
import { LoadingBlock } from "./StateBlock";
import { Button } from "@/components/ui/Button";
import { useJiraAccount } from "@/hooks/jari";

/**
 * Blocks a page's content until the user has a linked, non-expired Jira
 * account. Work/Worklog both write to Jira on the user's behalf, so a missing
 * or expired token must stop them up front with a clear next step — instead of
 * letting every action inside fail one by one with a raw Jira 401.
 */
export default function JiraLinkGate({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const { data: status, isLoading } = useJiraAccount();

  if (isLoading) return <LoadingBlock />;

  const expired = !!status?.hasToken && status.tokenExpired;
  const blocked = !status?.hasToken || expired;

  if (blocked) {
    return (
      <div className="space-y-6">
        <PageHeader title={title} subtitle={subtitle} icon={icon} />
        <div className="flex flex-col items-start gap-4 rounded-xl border border-warning-200 bg-warning-50 p-6">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 shrink-0 text-warning-600" size={22} />
            <div>
              <div className="font-semibold text-warning-900">
                {expired ? "API token ของคุณหมดอายุแล้ว" : "ยังไม่ได้เชื่อมบัญชี Jira"}
              </div>
              <p className="mt-1 text-sm text-warning-800">
                {expired
                  ? `Token หมดอายุไปแล้วเมื่อวันที่ ${status?.tokenExpiresAt} — ต้องสร้าง API token ใหม่และอัปเดตที่หน้าตั้งค่า ก่อนใช้งานเมนูนี้`
                  : "ต้องเชื่อมบัญชี Jira ของคุณเอง (email + API token) ที่หน้าตั้งค่าก่อน จึงจะใช้งานเมนูนี้ได้"}
              </p>
            </div>
          </div>
          <Link href="/settings">
            <Button iconLeft={<KeyRound size={16} />}>
              {expired ? "อัปเดต API token" : "ไปตั้งค่าบัญชี Jira"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
