import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EventManagementLayout({children,params}:LayoutProps<"/dashboard/events/[id]">){const user=await getCurrentUser();if(!user)redirect("/login");const{id}=await params;const event=await db.event.findFirst({where:{id,ownerId:user.id}});if(!event)notFound();return <main className="dashboard-content"><div className="dashboard-page-title"><div><span style={{display:"flex",alignItems:"center",gap:8}}><h2>{event.name}</h2><StatusBadge event={event}/></span><p>Manage this event and monitor verified performance.</p></div>{event.status!=="DRAFT"&&<Link className="button button-secondary" href={`/events/${event.slug}`} target="_blank">View public page <ExternalLink size={15}/></Link>}</div><nav className="category-tabs"><Link href={`/dashboard/events/${id}`}>Overview</Link><Link href={`/dashboard/events/${id}/categories`}>Categories</Link><Link href={`/dashboard/events/${id}/contestants`}>Contestants</Link><Link href={`/dashboard/events/${id}/transactions`}>Transactions</Link><Link href={`/dashboard/events/${id}/results`}>Results</Link></nav>{children}</main>}
