import { Search } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const metadata = { title: "Explore elections" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await ensureSeeded();
  const now = new Date();
  const events = await db.event.findMany({ where: { visibility: "PUBLIC", endAt: { gt: now }, status: { notIn: ["DRAFT", "CANCELLED"] } }, include: { owner: true, coverImage: true, categories: { include: { contestants: true } } }, orderBy: { endAt: "asc" } });
  return <><SiteHeader /><main><section className="page-hero"><div className="container"><span className="eyebrow">Explore elections</span><h1>Find a race worth<br />showing up for.</h1><p>Browse active public elections, meet the contestants and cast verified votes without creating an account.</p></div></section><section className="page-content"><div className="container"><div className="listing-toolbar"><h2>{events.length} elections accepting votes</h2><label className="search-box"><Search size={17} /><input placeholder="Search elections" aria-label="Search elections" /></label></div><div className="events-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div></div></section></main><SiteFooter /></>;
}
