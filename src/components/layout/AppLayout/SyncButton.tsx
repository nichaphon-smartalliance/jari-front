"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";

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
      await qc.invalidateQueries();
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
    <Button
      variant={error ? "destructive" : "secondary"}
      size="sm"
      onClick={sync}
      loading={syncing}
      iconLeft={!syncing && <RefreshCw size={16} />}
    >
      <span className="hidden sm:inline">
        {syncing
          ? "กำลัง Sync..."
          : error
            ? "Sync ล้มเหลว"
            : lastSynced
              ? `Sync ${lastSynced}`
              : "Sync Jira"}
      </span>
    </Button>
  );
}
