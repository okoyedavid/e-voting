import { ArrowDownLeft, Landmark, WalletCards } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [wallet, successful] = await Promise.all([
    db.wallet.findUnique({ where: { userId: user.id }, include: { entries: { orderBy: { createdAt: "desc" } } } }),
    db.voteTransaction.findMany({ where: { event: { ownerId: user.id }, paymentStatus: "SUCCESSFUL" } }),
  ]);
  const lifetime = successful.reduce((sum, transaction) => sum + transaction.organizerAmountMinor, 0);
  const fees = successful.reduce((sum, transaction) => sum + transaction.platformFeeMinor, 0);
  const settledIds = new Set((wallet?.entries ?? []).map((item) => item.eventId).filter(Boolean));
  const pending = successful.filter((transaction) => !settledIds.has(transaction.eventId)).reduce((sum, transaction) => sum + transaction.organizerAmountMinor, 0);
  return <main className="dashboard-content">
    <div className="dashboard-page-title"><div><h2>Earnings & wallet</h2><p>A complete, transparent record of your event income.</p></div><button className="button button-secondary" disabled><Landmark size={16} /> Payouts coming soon</button></div>
    <div className="stats-grid"><div className="stat-card"><span>Available balance</span><strong>{formatMoney(wallet?.availableBalanceMinor ?? 0)}</strong><small>Settled and available</small></div><div className="stat-card"><span>Pending earnings</span><strong>{formatMoney(pending)}</strong><small className="neutral">From active events</small></div><div className="stat-card"><span>Lifetime net earnings</span><strong>{formatMoney(lifetime)}</strong><small>After platform fees</small></div><div className="stat-card"><span>Platform fees paid</span><strong>{formatMoney(fees)}</strong><small className="neutral">5% of successful votes</small></div></div>
    <section className="dashboard-card" style={{ marginTop: 18 }}><div className="card-heading"><h3>Wallet ledger</h3><span>Immutable financial history</span></div>{wallet?.entries.length ? wallet.entries.map((entry) => <div className="ledger-row" key={entry.id}><i><ArrowDownLeft size={15} /></i><span><b>{entry.description}</b><small>{entry.type.replaceAll("_", " ")} · {entry.reference} · {entry.createdAt.toLocaleString("en-NG")}</small></span><strong>{entry.amountMinor >= 0 ? "+" : ""}{formatMoney(entry.amountMinor)}</strong></div>) : <div className="empty-state"><WalletCards /><h3>No ledger entries yet</h3><p>Net event earnings appear here when an event is finalized.</p></div>}</section>
  </main>;
}
