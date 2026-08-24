"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowUpRight, LockKeyhole, Medal } from "lucide-react";
import { VoteModal } from "@/components/vote-modal";
import { resolveImageUrl, type StoredImage } from "@/lib/image";

type Contestant = { id: string; name: string; description: string | null; imageUrl: string | null; imageAsset: StoredImage | null; voteTotal: number; status: string };
type Category = { id: string; name: string; description: string | null; priceOverrideMinor: number | null; contestants: Contestant[] };

export function EventVoting({ event }: { event: { slug: string; name: string; pricePerVoteMinor: number; currency: string; leaderboardVisibility: string; categories: Category[]; ended: boolean } }) {
  const [categoryId, setCategoryId] = useState(event.categories[0]?.id ?? "");
  const [selected, setSelected] = useState<Contestant | null>(null);
  const category = event.categories.find((item) => item.id === categoryId) ?? event.categories[0];
  const ranked = useMemo(() => [...(category?.contestants ?? [])].sort((a, b) => b.voteTotal - a.voteTotal), [category]);
  const totalsVisible = event.leaderboardVisibility === "LIVE" || event.ended;

  if (!category) return <div className="empty-state"><Medal size={30} /><h3>Categories are coming soon</h3><p>The organizer is still setting up this event.</p></div>;
  return <>
    <div className="category-tabs" role="tablist" aria-label="Voting categories">{event.categories.map((item) => <button key={item.id} role="tab" aria-selected={item.id === category.id} className={item.id === category.id ? "active" : ""} onClick={() => setCategoryId(item.id)}>{item.name}</button>)}</div>
    <div className="category-heading"><div><span className="eyebrow">Category {event.categories.findIndex((item) => item.id === category.id) + 1} of {event.categories.length}</span><h2>{category.name}</h2><p>{category.description}</p></div><span className="price-pill">{new Intl.NumberFormat("en-NG", { style: "currency", currency: event.currency, maximumFractionDigits: 0 }).format((category.priceOverrideMinor ?? event.pricePerVoteMinor) / 100)} / vote</span></div>
    {!totalsVisible && <div className="hidden-totals"><LockKeyhole size={18} /><div><strong>Live totals are private</strong><span>The organizer will reveal final results when voting ends.</span></div></div>}
    <div className="contestant-grid">{ranked.map((contestant, index) => {
      const leader = ranked[0];
      const next = ranked[index - 1];
      const gap = index === 0 ? contestant.voteTotal - (ranked[1]?.voteTotal ?? 0) : (next?.voteTotal ?? 0) - contestant.voteTotal;
      const contestantImage = resolveImageUrl(contestant.imageAsset, contestant.imageUrl, "portrait", "/person-placeholder.svg");
      return <article className={`contestant-card ${index === 0 ? "is-leader" : ""}`} key={contestant.id}>
        <div className="contestant-image-wrap"><Image src={contestantImage} alt={contestant.name} fill sizes="(max-width: 650px) 50vw, 25vw" /><span className="rank-number">#{index + 1}</span>{index === 0 && <span className="leading-badge">Leading</span>}</div>
        <div className="contestant-body"><h3>{contestant.name}</h3><p>{contestant.description}</p>{totalsVisible ? <><strong className="vote-total">{contestant.voteTotal.toLocaleString()} <small>votes</small></strong><span className={index === 0 ? "competitive leader" : "competitive"}>{index === 0 ? `Leading by ${gap.toLocaleString()} votes` : `${gap.toLocaleString()} votes behind ${next?.name ?? leader.name}`}</span></> : <span className="competitive">Ranking revealed after voting</span>}
          <button disabled={event.ended || contestant.status !== "ACTIVE"} className="button button-primary button-full" onClick={() => setSelected(contestant)}>{event.ended ? "Voting ended" : `Vote for ${contestant.name.split(" ")[0]}`} <ArrowUpRight size={17} /></button></div>
      </article>;
    })}</div>
    {selected && <VoteModal onClose={() => setSelected(null)} selection={{ contestantId: selected.id, contestantName: selected.name, contestantImage: resolveImageUrl(selected.imageAsset, selected.imageUrl, "portrait", "/person-placeholder.svg"), categoryId: category.id, categoryName: category.name, eventSlug: event.slug, eventName: event.name, unitPriceMinor: category.priceOverrideMinor ?? event.pricePerVoteMinor, currency: event.currency }} />}
  </>;
}
