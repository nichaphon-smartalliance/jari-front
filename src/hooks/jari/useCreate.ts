"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStory, getEpics, getProjects, getUsers } from "@/services/jari.service";

export const PROJECTS_QUERY_KEY = ["projects"] as const;
export const USERS_QUERY_KEY = ["users"] as const;

export const useProjects = () =>
  useQuery({ queryKey: PROJECTS_QUERY_KEY, queryFn: getProjects });

export const useUsers = () =>
  useQuery({ queryKey: USERS_QUERY_KEY, queryFn: getUsers });

export const useEpics = (projectKey: string) =>
  useQuery({
    queryKey: ["epics", projectKey],
    queryFn: () => getEpics(projectKey),
    enabled: Boolean(projectKey),
  });

export const useCreateStory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["myOpenIssues"] });
    },
  });
};
