"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyOpenIssues, markIssueDone } from "@/services/jari.service";
import type { StatusCategory } from "@/types/app/jira";

export const MY_WORK_QUERY_KEY = ["myOpenIssues"] as const;

export const useMyOpenIssues = (accountId: string, statusCategories?: StatusCategory[]) =>
  useQuery({
    queryKey: [...MY_WORK_QUERY_KEY, accountId, statusCategories ?? []],
    queryFn: () => getMyOpenIssues(accountId, statusCategories),
    enabled: !!accountId,
  });

export const useMarkDone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => markIssueDone(key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_WORK_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["worklogCandidates"] });
    },
  });
};
