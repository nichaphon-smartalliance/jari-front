"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/services/jari.service";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

export const useDashboard = () =>
  useQuery({ queryKey: DASHBOARD_QUERY_KEY, queryFn: getDashboard });
