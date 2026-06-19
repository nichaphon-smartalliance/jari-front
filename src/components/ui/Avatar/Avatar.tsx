const COLORS = [
  "bg-brand-100 text-brand-700",
  "bg-blue-100 text-blue-700",
  "bg-success-100 text-success-700",
  "bg-warning-100 text-warning-700",
  "bg-error-100 text-error-700",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const idx = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORS.length;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${COLORS[idx]}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}
