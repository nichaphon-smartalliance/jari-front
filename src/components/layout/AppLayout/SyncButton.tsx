"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";

export default function SyncButton() {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const sync = async () => {
    setSyncing(true);
    setError(false);
    try {
      await apiPost("/sync");
      await qc.invalidateQueries(); // refetch everything (dashboard, issues, users, ...)
      setLastSynced(
        new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      );
    } catch {
      setError(true);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={sync}
      disabled={syncing}
      className={`btn btn-sm gap-1 ${error ? "btn-error" : "btn-primary"}`}
    >
      <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
      <span className="hidden sm:inline">
        {syncing
          ? "กำลัง Sync..."
          : error
            ? "Sync ล้มเหลว"
            : lastSynced
              ? `Sync ${lastSynced}`
              : "Sync Jira"}
      </span>
    </button>
  );
}
