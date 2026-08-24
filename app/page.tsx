import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, Clock3, CreditCard, Radio, ShieldCheck, Sparkles, Trophy, UsersRound } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { resolveImageUrl } from "@/lib/image";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureSeeded();
  const now = new Date();
  const [events, winners, contestants] = await Promise.all([
    db.event.findMany({ where: { visibility: "PUBLIC", startAt: { lte: now }, endAt: { gt: now }, status: { not: "DRAFT" } }, include: { owner: true, coverImage: true, categories: { include: { contestants: true } } }, orderBy: { endAt: "asc" }, take: 3 }),
    db.finalResult.findMany({ where: { position: 1 }, include: { contestant: { include: { imageAsset: true } }, category: true, event: true }, orderBy: { finalizedAt: "desc" }, take: 3 }),
    db.contestant.findMany({ where: { status: "ACTIVE", category: { event: { endAt: { gt: now }, startAt: { lte: now }, visibility: "PUBLIC" } } }, include: { imageAsset: true, category: { include: { event: true } } }, orderBy: { voteTotal: "desc" }, take: 5 }),
  ]);
  const heroContestants = contestants.slice(0, 3);
  return <>
    <SiteHeader />
    <main>
      <section className="hero">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker"><Sparkles size={15} /> Built for moments that matter</span>
            <h1>Create elections.<br />Collect votes.<br /><em>See winners live.</em></h1>
            <p>Launch a beautiful online voting event in minutes. Share it with your audience, collect secure payments and watch the competition unfold.</p>
            <div className="hero-actions"><Link className="button button-primary button-lg" href="/signup">Create voting event <ArrowUpRight size={19} /></Link><Link className="button button-secondary button-lg" href="/events">Explore elections</Link></div>
            <div className="hero-trust"><span><Check size={15} /> No account needed to vote</span><span><ShieldCheck size={15} /> Payments verified securely</span></div>
            <p className="fee-note">Simple, transparent pricing: <strong>5% platform fee</strong> on successful votes.</p>
          </div>
          <div className="hero-visual" aria-label="Live election preview">
            <div className="live-card">
              <div className="live-card-head"><div><span className="status-badge status-live"><i />Live now</span><h2>Creator of the Year</h2><p>Lagos Creators Choice Awards</p></div><div className="mini-countdown"><span>ENDS IN</span><b>03 : 05 : 42</b></div></div>
              <div className="hero-ranking">{heroContestants.map((person, index) => <div className={index === 0 ? "top" : ""} key={person.id}><strong>0{index + 1}</strong><Image src={resolveImageUrl(person.imageAsset, person.imageUrl, "thumb", "/person-placeholder.svg")} width={50} height={50} alt="" /><span><b>{person.name}</b><small>{person.voteTotal.toLocaleString()} votes</small></span>{index === 0 && <i>+12%</i>}</div>)}</div>
              <div className="live-card-foot"><span><Radio size={14} /> Updated moments ago</span><Link href={events[0] ? `/events/${events[0].slug}` : "/events"}>View live election <ArrowRight size={15} /></Link></div>
            </div>
            <span className="floating-proof proof-one"><BadgeCheck size={19} /><span><b>Payment verified</b><small>50 votes counted</small></span></span>
            <span className="floating-proof proof-two"><Trophy size={19} /><span><b>Live rankings</b><small>Updated instantly</small></span></span>
          </div>
        </div>
      </section>
      <section className="trust-strip"><div className="container"><span>Built for</span><b>AWARD SHOWS</b><b>CAMPUSES</b><b>CREATOR EVENTS</b><b>COMMUNITIES</b><b>PAGEANTS</b></div></section>
      <section className="section how-section" id="how-it-works">
        <div className="container"><div className="section-intro centered"><span className="eyebrow">How it works</span><h2>From idea to a live election<br />in a few simple steps.</h2><p>You focus on the people and the moment. E-voting handles the voting, payments and live results.</p></div>
          <div className="steps-grid">
            <div><span className="step-icon"><UsersRound /></span><i>01</i><h3>Create your event</h3><p>Set up your election, dates and transparent vote price.</p></div>
            <div><span className="step-icon"><Sparkles /></span><i>02</i><h3>Add your nominees</h3><p>Build categories and add the people your audience loves.</p></div>
            <div><span className="step-icon"><Radio /></span><i>03</i><h3>Share & go live</h3><p>Publish your event and share one beautiful voting page.</p></div>
            <div><span className="step-icon"><CreditCard /></span><i>04</i><h3>Get paid</h3><p>Track verified votes and receive earnings when it ends.</p></div>
          </div>
        </div>
      </section>
      <section className="section events-section">
        <div className="container"><div className="section-heading"><div><span className="eyebrow live-eyebrow"><i />Happening now</span><h2>Votes are coming in.</h2><p>Discover public elections and support the people you believe in.</p></div><Link href="/events">Explore all elections <ArrowUpRight size={17} /></Link></div>
          <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div>
        </div>
      </section>
      <section className="section winners-section">
        <div className="container"><div className="section-heading"><div><span className="eyebrow">Recently crowned</span><h2>Meet the latest winners.</h2></div><div className="filter-pills"><button>Last hour</button><button className="active">Today</button><button>Last 24 hours</button></div></div>
          <div className="winner-grid">{winners.map((winner) => <article className="winner-card" key={winner.id}><div className="winner-image"><Image src={resolveImageUrl(winner.contestant.imageAsset, winner.contestant.imageUrl, "portrait", "/person-placeholder.svg")} alt={winner.contestant.name} fill sizes="(max-width: 700px) 100vw, 33vw" /><span><Trophy size={15} /> Winner</span></div><div><span className="eyebrow">{winner.category.name}</span><h3>{winner.contestant.name}</h3><p>{winner.event.name}</p><div><strong>{winner.finalVotes.toLocaleString()} votes</strong><small>Won by {winner.winningMargin.toLocaleString()}</small></div></div></article>)}</div>
          <div className="center-link"><Link href="/results">See all recent results <ArrowRight size={17} /></Link></div>
        </div>
      </section>
      <section className="section leaderboard-section">
        <div className="container leaderboard-layout"><div className="leaderboard-copy"><span className="eyebrow">Live leaderboards</span><h2>Every vote changes the race.</h2><p>Follow the contestants capturing attention right now. Rankings reflect confirmed votes only.</p><Link className="button button-secondary" href="/leaderboards">View all leaderboards <ArrowRight size={17} /></Link></div>
          <div className="leaderboard-panel"><div className="panel-head"><div><h3>Trending right now</h3><span>Across all live events</span></div><span className="live-indicator"><i /> LIVE</span></div>{contestants.map((person, index) => <Link href={`/events/${person.category.event.slug}`} className="leaderboard-row" key={person.id}><strong>{String(index + 1).padStart(2, "0")}</strong><Image src={resolveImageUrl(person.imageAsset, person.imageUrl, "thumb", "/person-placeholder.svg")} alt="" width={48} height={48} /><span><b>{person.name}</b><small>{person.category.name} · {person.category.event.name}</small></span><em>{person.voteTotal.toLocaleString()}<small> votes</small></em><ArrowUpRight size={16} /></Link>)}</div>
        </div>
      </section>
      <section className="section faq-section" id="faq"><div className="container faq-layout"><div className="faq-copy"><span className="eyebrow">Good to know</span><h2>Clear answers.<br />No fine print.</h2><p>Everything organizers and voters need to know before getting started.</p><div className="trust-card"><ShieldCheck /><div><strong>Votes you can trust</strong><span>Only provider-verified payments add votes. Failed and pending payments add zero.</span></div></div></div><div className="faq-list">
        {[["What does E-voting do?", "E-voting lets organizers launch paid online elections, collect verified votes and publish live or final results from one shareable page."], ["Do voters need an account?", "No. Voters choose a contestant, select a vote quantity, enter an email and pay. The email is used for payment confirmation only."], ["How are payments and votes confirmed?", "Pricing is calculated on our server. Votes are credited only after the payment provider verifies the transaction, so browser callbacks cannot manufacture votes."], ["What is the platform fee?", "E-voting deducts a transparent 5% from every successful vote transaction. Organizers keep 95%; voters see the full amount before paying."], ["When do organizers receive earnings?", "When an event concludes, we finalize every category, calculate gross earnings and fees, then credit net earnings to the organizer ledger."], ["What happens when an event expires?", "New purchases stop immediately. Winners and vote totals are finalized and the event remains available as a historical result."], ["Do results update live?", "Yes, when the organizer enables public live totals. They can also keep totals private until the election ends."], ["What if a payment fails?", "Failed and pending payments add no votes. You can retry safely; idempotency protection prevents successful payments from being counted twice."]].map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></div></section>
      <section className="final-cta"><div className="container"><div><span className="eyebrow">Your audience is ready</span><h2>Make your next moment<br />one they can take part in.</h2><p>Create a polished voting event, share it anywhere and watch the story unfold.</p><Link href="/signup" className="button button-light button-lg">Create your voting event <ArrowUpRight size={19} /></Link><span className="cta-foot"><Clock3 size={15} /> Get set up in minutes · 5% fee on successful votes</span></div></div></section>
    </main>
    <SiteFooter />
  </>;
}
