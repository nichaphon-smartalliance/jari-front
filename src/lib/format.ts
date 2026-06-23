export const SECONDS_PER_HOUR = 3600;
export const WORKDAY_SECONDS = 8 * SECONDS_PER_HOUR; // 8h target

/** 9000 -> "2h 30m", 3600 -> "1h", 1800 -> "30m" */
export function formatDuration(seconds: number): string {
  if (!seconds) return "0h";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ") || "0h";
}

/** "3h 30m" / "2h" / "45m" -> seconds */
export function parseDuration(input: string): number {
  let total = 0;
  const h = input.match(/(\d+)\s*h/);
  const m = input.match(/(\d+)\s*m/);
  if (h) total += Number(h[1]) * 3600;
  if (m) total += Number(m[1]) * 60;
  return total;
}

export function hoursToSeconds(hours: number): number {
  return Math.round(hours * 3600);
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** Local calendar date as YYYY-MM-DD (not UTC) — correct for date pickers so the
 *  user sees their own "today" regardless of timezone offset. */
export function localDateISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
