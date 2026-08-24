import { resolveEventStatus } from "@/lib/status";

export function StatusBadge({ event }: { event: { status: string; startAt: Date; endAt: Date } }) {
  const status = resolveEventStatus(event);
  return <span className={`status-badge status-${status.toLowerCase()}`}><i />{status}</span>;
}
