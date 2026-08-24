import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, Layers3 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatNumber } from "@/lib/money";
import { timeRemaining } from "@/lib/status";
import { resolveImageUrl, type StoredImage } from "@/lib/image";

type EventCardData = {
  slug: string; name: string; description: string; coverUrl: string | null; coverImage: StoredImage | null;
  startAt: Date; endAt: Date; status: string; owner: { name: string };
  categories: { contestants: { voteTotal: number }[] }[];
};

export function EventCard({ event }: { event: EventCardData }) {
  const votes = event.categories.reduce((sum, category) => sum + category.contestants.reduce((v, contestant) => v + contestant.voteTotal, 0), 0);
  return (
    <article className="event-card">
      <Link href={`/events/${event.slug}`} className="event-image-wrap" aria-label={`View ${event.name}`}>
        <Image src={resolveImageUrl(event.coverImage, event.coverUrl, "cover", "/event-placeholder.svg")} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" className="event-image" />
        <StatusBadge event={event} />
      </Link>
      <div className="event-card-body">
        <span className="eyebrow">By {event.owner.name}</span>
        <h3><Link href={`/events/${event.slug}`}>{event.name}</Link></h3>
        <p>{event.description}</p>
        <div className="event-meta">
          <span><Layers3 size={15} />{event.categories.length} categories</span>
          <span><Clock3 size={15} />{timeRemaining(event.endAt)} left</span>
        </div>
        <div className="event-card-footer"><strong>{formatNumber(votes)} <small>votes</small></strong><Link href={`/events/${event.slug}`}>Vote now <ArrowUpRight size={16} /></Link></div>
      </div>
    </article>
  );
}
