import Image from "next/image";
import { CheckCircle2, Share2, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/countdown";
import { EventVoting } from "@/components/event-voting";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { db } from "@/lib/db";
import { resolveImageUrl } from "@/lib/image";
import { ensureSeeded } from "@/lib/seed";
import { resolveEventStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  await ensureSeeded();
  const { slug } = await params;
  const event = await db.event.findUnique({
    where: { slug },
    include: {
      owner: true,
      coverImage: true,
      categories: {
        where: { status: "ACTIVE" },
        orderBy: { displayOrder: "asc" },
        include: { imageAsset: true, contestants: { where: { status: { in: ["ACTIVE", "DISABLED"] } }, include: { imageAsset: true } } },
      },
    },
  });
  if (!event || (event.visibility !== "PUBLIC" && event.status === "DRAFT")) notFound();
  const status = resolveEventStatus(event);
  const contestants = event.categories.flatMap((item) => item.contestants);
  const votes = contestants.reduce((sum, item) => sum + item.voteTotal, 0);
  const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });
  return <><SiteHeader /><main>
    <section className="event-hero"><div className="container">
      <div className="event-banner"><Image src={resolveImageUrl(event.coverImage, event.coverUrl, "cover", "/event-placeholder.svg")} alt={`${event.name} cover`} fill priority sizes="100vw" /><div className="event-overlay"><StatusBadge event={event} /><h1>{event.name}</h1><p>{event.description}</p><span className="event-owner"><CheckCircle2 size={15} /> Organized by {event.owner.name}</span></div></div>
      <div className="event-summary-bar"><div><span>Voting window</span><strong>{date.format(event.startAt)} — {date.format(event.endAt)}</strong></div><div><span>Total votes</span><strong>{votes.toLocaleString()}</strong></div><div><span>Contestants</span><strong>{contestants.length}</strong></div><div><span>Categories</span><strong>{event.categories.length}</strong></div><div><span>{status === "ENDED" ? "Status" : "Time remaining"}</span>{status === "ENDED" ? <strong>Voting ended</strong> : <Countdown endAt={event.endAt.toISOString()} />}</div></div>
    </div></section>
    <section className="event-main"><div className="container"><div className="listing-toolbar"><div><span className="eyebrow">Choose a category</span><h2>Who gets your vote?</h2></div><button className="button button-secondary"><Share2 size={16} /> Share event</button></div><EventVoting event={{ slug: event.slug, name: event.name, pricePerVoteMinor: event.pricePerVoteMinor, currency: event.currency, leaderboardVisibility: event.leaderboardVisibility, categories: event.categories, ended: status === "ENDED" }} /><div className="trust-card" style={{ maxWidth: "100%", marginTop: 40 }}><UsersRound /><div><strong>Fair voting, every time</strong><span>Only confirmed payments are included in these rankings. Pending or failed payments never add votes.</span></div></div></div></section>
  </main><SiteFooter /></>;
}
