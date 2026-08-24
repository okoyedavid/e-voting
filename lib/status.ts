export type EventStatus = "DRAFT" | "UPCOMING" | "LIVE" | "ENDED" | "CANCELLED";

export function resolveEventStatus(event: {
  status: string;
  startAt: Date;
  endAt: Date;
}, now = new Date()): EventStatus {
  if (event.status === "DRAFT" || event.status === "CANCELLED") {
    return event.status as EventStatus;
  }
  if (now < event.startAt) return "UPCOMING";
  if (now >= event.endAt) return "ENDED";
  return "LIVE";
}

export function timeRemaining(endAt: Date, now = new Date()) {
  const ms = Math.max(0, endAt.getTime() - now.getTime());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
}
