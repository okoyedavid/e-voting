import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic="force-dynamic";
export default async function DashboardEventsPage(){const user=await getCurrentUser();if(!user)redirect("/login");const events=await db.event.findMany({where:{ownerId:user.id},include:{categories:{include:{contestants:true}},transactions:true},orderBy:{createdAt:"desc"}});return <main className="dashboard-content"><div className="dashboard-page-title"><div><h2>Events</h2><p>Create, publish and manage all your voting events.</p></div><Link href="/dashboard/events/new" className="button button-primary"><Plus size={16}/> Create event</Link></div><div className="data-card">{events.length?<table className="data-table"><thead><tr><th>Event</th><th>Status</th><th>Categories</th><th>Votes</th><th>Gross revenue</th><th>Ends</th></tr></thead><tbody>{events.map(event=>{const successful=event.transactions.filter(tx=>tx.paymentStatus==="SUCCESSFUL");return <tr key={event.id}><td><Link href={`/dashboard/events/${event.id}`}><strong>{event.name}</strong><small>/{event.slug}</small></Link></td><td><StatusBadge event={event}/></td><td>{event.categories.length}</td><td>{successful.reduce((s,tx)=>s+tx.quantity,0).toLocaleString()}</td><td>{formatMoney(successful.reduce((s,tx)=>s+tx.grossAmountMinor,0))}</td><td>{event.endAt.toLocaleDateString("en-NG")}</td></tr>})}</tbody></table>:<div className="empty-state"><h3>No events yet</h3><p>Create your first voting event and start collecting verified votes.</p><Link className="button button-primary" href="/dashboard/events/new">Create event</Link></div>}</div></main>}
