"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJiraAccount, updateJiraAccount } from "@/services/jari.service";
import { WORKLOG_CANDIDATES_QUERY_KEY, DAILY_QUERY_KEY } from "./useWorklog";

export const JIRA_ACCOUNT_QUERY_KEY = ["jiraAccount"] as const;

export const useJiraAccount = () =>
  useQuery({ queryKey: JIRA_ACCOUNT_QUERY_KEY, queryFn: getJiraAccount });

export const useUpdateJiraAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateJiraAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: JIRA_ACCOUNT_QUERY_KEY });
      // accountId may have just been set/changed — refresh anything keyed on "me".
      qc.invalidateQueries({ queryKey: WORKLOG_CANDIDATES_QUERY_KEY });
      qc.invalidateQueries({ queryKey: DAILY_QUERY_KEY });
    },
  });
};
