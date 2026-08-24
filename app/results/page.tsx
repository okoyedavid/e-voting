import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/lib/db";
import { resolveImageUrl } from "@/lib/image";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recent results" };

export default async function ResultsPage() {
  await ensureSeeded();
  const winners = await db.finalResult.findMany({ where: { position: 1 }, include: { contestant: { include: { imageAsset: true } }, category: true, event: true }, orderBy: { finalizedAt: "desc" } });
  return <><SiteHeader /><main><section className="page-hero"><div className="container"><span className="eyebrow">Final results</span><h1>The votes are in.<br />Meet the winners.</h1><p>Verified final results from recently concluded elections on E-voting.</p></div></section><section className="page-content winners-section"><div className="container"><div className="winner-grid">{winners.map((winner) => <article className="winner-card" key={winner.id}><div className="winner-image"><Image src={resolveImageUrl(winner.contestant.imageAsset, winner.contestant.imageUrl, "portrait", "/person-placeholder.svg")} alt={winner.contestant.name} fill /><span><Trophy size={15} /> Winner</span></div><div><span className="eyebrow">{winner.category.name}</span><h3>{winner.contestant.name}</h3><p>{winner.event.name}</p><div><strong>{winner.finalVotes.toLocaleString()} votes</strong><small>Winning margin: {winner.winningMargin.toLocaleString()}</small></div><Link href={`/events/${winner.event.slug}`} className="center-link">Full results <ArrowUpRight size={14} /></Link></div></article>)}</div></div></section></main><SiteFooter /></>;
}
