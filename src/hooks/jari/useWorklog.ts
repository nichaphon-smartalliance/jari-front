"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorklog,
  getDailyData,
  getWorklogCandidates,
} from "@/services/jari.service";

export const WORKLOG_CANDIDATES_QUERY_KEY = ["worklogCandidates"] as const;
export const DAILY_QUERY_KEY = ["daily"] as const;

export const useWorklogCandidates = (accountId: string) =>
  useQuery({
    queryKey: [...WORKLOG_CANDIDATES_QUERY_KEY, accountId],
    queryFn: () => getWorklogCandidates(accountId),
    enabled: !!accountId,
  });

export const useDailyData = (date: string) =>
  useQuery({
    queryKey: [...DAILY_QUERY_KEY, date],
    queryFn: () => getDailyData(date),
  });

export const useCreateWorklog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorklog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKLOG_CANDIDATES_QUERY_KEY });
      qc.invalidateQueries({ queryKey: DAILY_QUERY_KEY });
    },
  });
};
