import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/lib/db";
import { resolveImageUrl } from "@/lib/image";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leaderboards" };

export default async function LeaderboardsPage() {
  await ensureSeeded();
  const contestants = await db.contestant.findMany({ where: { category: { event: { endAt: { gt: new Date() }, visibility: "PUBLIC" } } }, include: { imageAsset: true, category: { include: { event: true } } }, orderBy: { voteTotal: "desc" }, take: 30 });
  return <><SiteHeader /><main><section className="page-hero"><div className="container"><span className="eyebrow">Live leaderboards</span><h1>These are the names<br />everyone is watching.</h1><p>Ranked by confirmed votes across public live events. Every position is earned.</p></div></section><section className="page-content"><div className="container"><div className="leaderboard-panel">{contestants.map((person, index) => <Link href={`/events/${person.category.event.slug}`} className="leaderboard-row" key={person.id}><strong>{String(index + 1).padStart(2, "0")}</strong><Image src={resolveImageUrl(person.imageAsset, person.imageUrl, "thumb", "/person-placeholder.svg")} alt="" width={48} height={48} /><span><b>{person.name}</b><small>{person.category.name} · {person.category.event.name}</small></span><em>{person.voteTotal.toLocaleString()}<small> votes</small></em><ArrowUpRight size={16} /></Link>)}</div></div></section></main><SiteFooter /></>;
}
