import type { Metadata } from "next";
import {
  ArrowDown,
  BadgeCheck,
  Banknote,
  BookOpen,
  Boxes,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  GraduationCap,
  ImageIcon,
  Layers3,
  LockKeyhole,
  MonitorSmartphone,
  Network,
  ReceiptText,
  ServerCog,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
  Vote,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Project Info",
  description: "Academic and technical project summary for the E-voting Online Electronic Voting and Election Management System.",
  openGraph: {
    title: "E-voting — Project Information",
    description: "Academic and technical overview of the E-voting system developed by Nwachukwu Emmanuel Ifeanyi.",
    type: "article",
  },
};

const organizerFlow = ["Create account", "Log in", "Accept Terms of Service", "Create voting event", "Configure price and duration", "Upload event cover", "Create categories", "Add contestants", "Upload contestant images", "Publish event", "Share voting link", "Monitor votes and transactions", "Voting period ends", "System finalizes results", "Winners are determined", "5% platform fee is deducted", "Net earnings are credited"];
const voterFlow = ["Open public event", "Choose category", "Choose contestant", "Select number of votes", "Enter email", "Proceed to payment", "Payment provider processes transaction", "Backend verifies payment", "Votes are credited once", "Leaderboard updates", "Vote confirmation is displayed"];

function SectionTitle({ number, title, description }: { number: string; title: string; description?: string }) {
  return <div className="info-section-title"><span>{number}</span><div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>;
}

function Flow({ steps }: { steps: string[] }) {
  return <div className="defense-flow">{steps.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < steps.length - 1 && <ArrowDown size={14} />}</div>)}</div>;
}

export default function ProjectInfoPage() {
  const objectives = ["Digitize voting-event creation and management", "Enable remote participation without voter accounts", "Support electronic payment for paid voting", "Maintain live rankings from confirmed votes", "Provide transparent organizer financial records", "Determine winners automatically at closing time", "Preserve historical votes and transactions", "Reduce manual counting and improve accessibility"];
  const security = ["Server-side input validation with Zod and domain checks", "Organizer authentication and resource ownership authorization", "Backend-controlled vote pricing and financial calculations", "Provider verification before any vote allocation", "Unique references, idempotency keys and webhook-event protection", "Server-side event expiration checks and scheduled finalization", "Restricted image type, size and signature validation", "Environment-only API secrets; none are sent to the browser", "Salted PBKDF2 password hashes; passwords are never stored as plain text"];
  const technologies = [
    ["Next.js 16", "Application framework", "App Router pages, layouts, Server Actions, Route Handlers and frontend/backend integration."],
    ["React 19", "User interface", "Reusable interactive components for voting, payment and image-upload experiences."],
    ["TypeScript", "Type safety", "Static checks across UI, server logic, API contracts and database access."],
    ["Tailwind CSS 4", "Styling foundation", "Responsive utility processing alongside the project’s custom design system."],
    ["Lucide React", "Interface icons", "One consistent accessible icon language across public and organizer pages."],
    ["Node.js", "Server runtime", "Executes authentication, validation, payment, image and settlement logic."],
    ["Prisma 6", "Data access", "Typed PostgreSQL queries, relationships and atomic database transactions."],
    ["PostgreSQL / Neon", "Database", "Stores relational voting, payment, settlement, session and ledger records."],
    ["Cloudinary", "Media storage", "Secure cloud image storage, CDN delivery and responsive transformations."],
    ["Paystack", "Payment processing", "Initializes checkout and supports server verification and signed webhooks."],
    ["Zod", "Validation", "Validates untrusted form and API input on the server."],
    ["Vercel Cron", "Background finalization", "Invokes protected settlement logic independently of browser activity."],
  ];
  const entities = [
    ["User", "Organizer identity, password hash and account ownership."], ["Terms Acceptance", "Accepted terms version and timestamp."], ["Event", "Election settings, schedule, pricing and visibility."], ["Category", "A competition group contained by an event."], ["Contestant", "A nominee contained by a category with confirmed vote total."], ["Vote Transaction", "Payment reference, status, quantity and immutable monetary split."], ["Vote Allocation", "Aggregate confirmed votes assigned by one successful transaction."], ["Event Settlement", "Final vote and financial summary for a completed event."], ["Wallet / Ledger", "Organizer balance and immutable movement history."], ["Image Asset", "Cloudinary URLs, public ID, dimensions, format and byte size."],
  ];
  const publicPages = ["Home", "Explore Events", "Event Details", "Results", "Leaderboards", "FAQ/About", "Project Info", "Login", "Signup"];
  const organizerPages = ["Dashboard", "Events", "Create Event", "Event Management", "Categories", "Contestants", "Transactions", "Results", "Earnings", "Settings"];
  const future = ["Organizer identity verification", "Automated bank payouts", "Additional payment providers", "Email receipts and SMS notifications", "Advanced fraud and device-risk monitoring", "Extended election analytics and audit reporting", "Event QR codes and custom domains", "Multi-currency voting and refund management", "Progressive Web App support"];

  return <><SiteHeader /><main className="project-info-page">
    <section className="project-hero"><div className="container project-hero-grid"><div><span className="project-label"><GraduationCap size={16} /> Academic software project</span><h1>E-voting</h1><h2>Online Electronic Voting and Election Management System</h2><p>E-voting is a web-based electronic voting platform designed to allow users to create voting events, securely cast paid votes online, monitor live results and determine winners electronically.</p><span className="academic-note">Developed as an academic software project in partial fulfillment of the requirements for a Bachelor of Science degree.</span></div><aside className="student-card"><div className="student-card-head"><BookOpen /><span>Project identification</span></div><dl><div><dt>Student name</dt><dd>Nwachukwu Emmanuel Ifeanyi</dd></div><div><dt>Programme</dt><dd>Computer Science</dd></div><div><dt>Supervisor</dt><dd>Mr Ngene</dd></div><div><dt>Award</dt><dd>Bachelor of Science (B.Sc.) in Computer Science</dd></div></dl></aside></div></section>

    <nav className="project-toc"><div className="container"><a href="#overview">Overview</a><a href="#flows">System flows</a><a href="#architecture">Architecture</a><a href="#technologies">Technologies</a><a href="#data-model">Data model</a><a href="#security">Security</a><a href="#scope">Scope</a></div></nav>

    <section className="info-section" id="overview"><div className="container"><SectionTitle number="01" title="Project overview" description="A concise technical definition of the problem and system objectives." /><div className="info-two-col"><div className="info-prose"><h3>Purpose</h3><p>E-voting provides a digital environment where authenticated organizers create and operate voting events while members of the public participate remotely without creating accounts. The application connects event management, paid-vote verification, rankings, winner determination and organizer accounting in one system.</p><h3>Major objectives</h3><div className="objective-grid">{objectives.map((objective) => <span key={objective}><CheckCircle2 size={16} />{objective}</span>)}</div></div><div className="user-type-stack"><article><span className="info-icon"><UserRound /></span><h3>Event organizer</h3><p>Must register, log in and accept the platform terms. Organizers create scheduled events, configure vote prices, upload media, manage categories and contestants, publish elections, inspect votes and transactions, review winners, and distinguish gross revenue, platform deductions and net earnings.</p></article><article><span className="info-icon"><Vote /></span><h3>Voter</h3><p>Does not need an account. A voter opens a public event, browses categories and rankings, chooses a contestant and quantity, supplies an email, completes payment and sees confirmation only after the backend verifies that payment.</p></article></div></div></div></section>

    <section className="info-section info-section-alt" id="flows"><div className="container"><SectionTitle number="02" title="Complete system flow" description="The two principal journeys through the implemented application." /><div className="flow-columns"><article><div className="flow-heading"><UserRound /><div><h3>Organizer flow</h3><p>From registration to financial settlement.</p></div></div><Flow steps={organizerFlow} /></article><article><div className="flow-heading"><UsersRound /><div><h3>Voter flow</h3><p>From a shared link to a confirmed vote.</p></div></div><Flow steps={voterFlow} /><div className="integrity-callout"><ShieldCheck /><p><strong>A frontend success message never creates votes.</strong> The backend must verify the provider reference and amount before one atomic operation marks the transaction successful and creates its vote allocation.</p></div></article></div></div></section>

    <section className="info-section"><div className="container"><SectionTitle number="03" title="Voting, winners and finance" description="How confirmed payments become rankings and completed results." /><div className="explanation-grid"><article><Vote /><h3>Voting logic</h3><p>Each contestant belongs to one category. The voter chooses a contestant and quantity; the server loads the applicable stored price.</p><code>20 votes × ₦100 = ₦2,000</code><code>previousVotes + confirmedVotes = newVoteTotal</code><p>Only successful transactions contribute to totals. Pending and failed payments contribute zero.</p></article><article><Trophy /><h3>Winner determination</h3><ol><li>Voting closes at the configured server time.</li><li>Further purchases are rejected.</li><li>Contestants are ordered by confirmed votes.</li><li>The highest total in each category wins.</li><li>Final results and margins are preserved.</li><li>Event settlement is calculated.</li></ol><p>A protected scheduled server route performs this work; browser countdowns only display time.</p></article><article><Banknote /><h3>Financial model</h3><p>E-voting charges <strong>5% of successful voting transactions</strong>.</p><dl className="finance-example"><div><dt>Gross voting revenue</dt><dd>₦100,000</dd></div><div><dt>Platform fee (5%)</dt><dd>− ₦5,000</dd></div><div><dt>Organizer net earnings</dt><dd>₦95,000</dd></div></dl><p>Transactions, settlements and immutable ledger entries keep every movement traceable.</p></article></div></div></section>

    <section className="info-section info-section-dark" id="architecture"><div className="container"><SectionTitle number="04" title="System architecture" description="A full-stack Next.js application with external media and payment services." /><div className="architecture-diagram"><div><MonitorSmartphone /><strong>User browser</strong><small>Public voting and organizer interface</small></div><ArrowDown /><div><Layers3 /><strong>E-voting frontend</strong><small>React components and App Router pages</small></div><ArrowDown /><div className="architecture-core"><ServerCog /><strong>Application backend / API</strong><small>Server Actions, Route Handlers and domain services</small></div><div className="architecture-branches"><span><Database /><b>PostgreSQL / Neon</b><small>Relational system records</small></span><span><Cloud /><b>Cloudinary</b><small>Image storage and CDN</small></span><span><ReceiptText /><b>Paystack</b><small>Payment processing</small></span></div></div><div className="payment-architecture"><h3>Secure payment architecture</h3>{["Voter requests a vote purchase", "Backend validates event, category and contestant", "Backend resolves price and calculates the amount", "Pending transaction and unique reference are created", "Provider checkout processes payment", "Signed webhook or callback reaches the backend", "Backend verifies reference, amount and currency", "Transaction and aggregate vote allocation are committed atomically", "Duplicate callbacks return without crediting again"].map((step, index) => <div key={step}><span>{index + 1}</span><p>{step}</p></div>)}</div></div></section>

    <section className="info-section" id="technologies"><div className="container"><SectionTitle number="05" title="Technology choices" description="Only technologies installed and used by this implementation are listed." /><div className="technology-grid">{technologies.map(([name, role, reason]) => <article key={name}><span>{role}</span><h3>{name}</h3><p>{reason}</p></article>)}</div><div className="backend-responsibility"><ServerCog /><div><h3>Backend responsibilities</h3><p>The Node.js/Next.js server layer performs authentication, authorization, event management, vote validation, payment verification, vote recording, financial calculations, Cloudinary operations and Prisma database access. Express.js, MongoDB, Redis and shadcn/ui are not part of this implementation.</p></div></div></div></section>

    <section className="info-section info-section-alt" id="data-model"><div className="container"><SectionTitle number="06" title="Data model and relationships" description="Relational entities preserve voting integrity, ownership and financial history." /><div className="entity-grid">{entities.map(([name, description]) => <article key={name}><h3>{name}</h3><p>{description}</p></article>)}</div><div className="relationship-diagram"><div><strong>User</strong><small>owns</small></div><ArrowDown /><div><strong>Event</strong><small>contains</small></div><ArrowDown /><div><strong>Category</strong><small>contains</small></div><ArrowDown /><div><strong>Contestant</strong><small>receives confirmed allocations</small></div></div><div className="relationship-note"><Network /><p><strong>Vote Transaction</strong> references Event → Category → Contestant. A successful transaction produces one aggregate <strong>Vote Allocation</strong>. A completed Event produces an <strong>Event Settlement</strong>, which creates an organizer <strong>Ledger</strong> entry and updates the wallet balance.</p></div></div></section>

    <section className="info-section" id="security"><div className="container"><SectionTitle number="07" title="Security and media decisions" description="Important safeguards applied at trust boundaries." /><div className="security-grid">{security.map((decision) => <span key={decision}><LockKeyhole size={16} />{decision}</span>)}</div><div className="image-flow-card"><div><ImageIcon /><span><h3>Cloudinary image flow</h3><p>Images stay outside the application database and server filesystem.</p></span></div><div className="horizontal-flow">{["Organizer selects image", "Application validates file", "Server uploads to Cloudinary", "Asset metadata is stored", "Optimized CDN image is delivered"].map((item, index) => <span key={item}><b>{item}</b>{index < 4 && <em>→</em>}</span>)}</div><p>Event covers, category artwork and contestant photographs use authenticated server uploads, restricted formats and sizes, event-scoped folders, stored public IDs, replacement cleanup, automatic quality/format and responsive transformations.</p></div></div></section>

    <section className="info-section info-section-dark"><div className="container"><SectionTitle number="08" title="Event lifecycle and interfaces" /><div className="lifecycle"><span><b>Draft</b><small>Not publicly voteable</small></span><em>→</em><span><b>Upcoming</b><small>Waiting for start time</small></span><em>→</em><span><b>Live</b><small>Accepting verified votes</small></span><em>→</em><span><b>Ended</b><small>Final results preserved</small></span></div><p className="lifecycle-note">Cancelled is also supported as a terminal status. The server evaluates event time for every purchase, so an expired event cannot accept votes even if a browser remains open.</p><div className="page-list-grid"><article><h3>Public pages</h3>{publicPages.map((page) => <span key={page}><CheckCircle2 size={14} />{page}</span>)}</article><article><h3>Organizer pages</h3>{organizerPages.map((page) => <span key={page}><CheckCircle2 size={14} />{page}</span>)}</article></div></div></section>

    <section className="info-section" id="scope"><div className="container"><SectionTitle number="09" title="Development approach and design decisions" /><div className="decision-grid"><article><h3>No voter account</h3><p>Removes friction from shared links while preserving payment confirmation by email.</p></article><article><h3>Organizer authentication</h3><p>Events, private analytics and financial records remain tied to an identifiable owner.</p></article><article><h3>Server-authoritative votes and pricing</h3><p>The browser cannot select an untrusted price or directly increase a contestant total.</p></article><article><h3>Transaction-based voting</h3><p>Every paid allocation remains connected to one verifiable payment transaction.</p></article><article><h3>Cloudinary media storage</h3><p>Uploaded binaries remain outside PostgreSQL and the application server.</p></article><article><h3>Historical results</h3><p>Final rankings, financial settlement and paid-vote history remain available after closing.</p></article></div><div className="development-steps"><h3>Modular development sequence</h3><ol>{["Define interface and domain requirements", "Create reusable responsive UI components", "Design relational entities and invariants", "Implement organizer authentication and authorization", "Build event, category and contestant management", "Implement server-authoritative voting", "Integrate payment verification and idempotency", "Integrate secure Cloudinary uploads", "Calculate rankings, winners and settlements", "Build organizer analytics and financial summaries", "Validate responsive behavior, types and production build"].map((step) => <li key={step}>{step}</li>)}</ol></div></div></section>

    <section className="info-section info-section-alt"><div className="container"><SectionTitle number="10" title="Project scope and future improvements" /><div className="scope-grid"><article><Boxes /><h3>Implemented scope</h3><p>Electronic event creation, online paid voting, categories, contestants, vote counting, leaderboards, winner determination, organizer analytics, transparent financial calculations, authentication, Cloudinary media management and responsive public/organizer interfaces.</p><p>Actual organizer bank withdrawals are not implemented. The wallet and immutable ledger architecture provides a clean foundation for future payout functionality.</p></article><article><Code2 /><h3>Possible future improvements</h3><div className="future-tags">{future.map((item) => <span key={item}>{item}</span>)}</div></article></div></div></section>

    <section className="academic-statement"><div className="container"><span className="project-label"><BadgeCheck size={15} /> Academic statement</span><h2>Developed by Nwachukwu Emmanuel Ifeanyi</h2><dl><div><dt>Programme</dt><dd>Computer Science</dd></div><div><dt>Supervisor</dt><dd>Mr Ngene</dd></div><div><dt>Award</dt><dd>Bachelor of Science (B.Sc.) in Computer Science</dd></div></dl><p>Developed in partial fulfillment of the requirements for the award of a Bachelor of Science (B.Sc.) degree in Computer Science.</p></div></section>
  </main><SiteFooter /></>;
}
