"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProjectStatus,
  getSprintTimeline,
  getSprintWorkload,
} from "@/services/jari.service";

export const useSprintWorkload = () =>
  useQuery({ queryKey: ["sprintWorkload"], queryFn: getSprintWorkload });

export const useSprintTimeline = () =>
  useQuery({ queryKey: ["sprintTimeline"], queryFn: getSprintTimeline });

export const useProjectStatus = () =>
  useQuery({ queryKey: ["projectStatus"], queryFn: getProjectStatus });
