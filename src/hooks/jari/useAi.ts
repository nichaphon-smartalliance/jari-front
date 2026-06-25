"use client";

import { useMutation } from "@tanstack/react-query";
import {
  backfillWorklogs,
  planWorklogs,
  rewriteText,
  suggestSubtasks,
} from "@/services/ai.service";
import type { Issue } from "@/types/app/jira";

export const useRewriteText = () =>
  useMutation({
    mutationFn: ({ raw, kind }: { raw: string; kind: "title" | "description" }) =>
      rewriteText(raw, kind),
  });

export const useSuggestSubtasks = () =>
  useMutation({
    mutationFn: ({ title, description }: { title: string; description: string }) =>
      suggestSubtasks(title, description),
  });

export const usePlanWorklogs = () =>
  useMutation({
    mutationFn: ({
      candidates,
      alreadyLoggedSeconds,
    }: {
      candidates: Issue[];
      alreadyLoggedSeconds: number;
    }) => planWorklogs(candidates, alreadyLoggedSeconds),
  });

export const useBackfillWorklogs = () =>
  useMutation({
    mutationFn: ({
      candidates,
      accountId,
      startDate,
    }: {
      candidates: Issue[];
      accountId: string;
      startDate: string;
    }) => backfillWorklogs(candidates, accountId, startDate),
  });
