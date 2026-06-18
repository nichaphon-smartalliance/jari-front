"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyOpenIssues, markIssueDone } from "@/services/jari.service";

export const MY_WORK_QUERY_KEY = ["myOpenIssues"] as const;

export const useMyOpenIssues = (accountId: string) =>
  useQuery({
    queryKey: [...MY_WORK_QUERY_KEY, accountId],
    queryFn: () => getMyOpenIssues(accountId),
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
