import Link from "next/link";
import { CalendarRange, CreditCard, LayoutDashboard, LogOut, Plus, Settings, WalletCards } from "lucide-react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  return <div className="dashboard-shell"><aside className="dashboard-sidebar"><Logo light /><Link href="/dashboard/events/new" className="button button-primary"><Plus size={16} /><span>Create event</span></Link><nav><Link href="/dashboard"><LayoutDashboard size={17}/><span>Overview</span></Link><Link href="/dashboard/events"><CalendarRange size={17}/><span>Events</span></Link><Link href="/dashboard/earnings"><WalletCards size={17}/><span>Earnings</span></Link><Link href="/dashboard/transactions"><CreditCard size={17}/><span>Transactions</span></Link><Link href="/dashboard/settings"><Settings size={17}/><span>Settings</span></Link></nav><div className="sidebar-user"><span>{user.name.slice(0,1).toUpperCase()}</span><div><b>{user.name}</b><small>{user.email}</small></div><form action={logoutAction}><button aria-label="Log out" style={{background:"none",border:0,color:"#8d96a9",cursor:"pointer"}}><LogOut size={16}/></button></form></div></aside><div className="dashboard-main"><header className="dashboard-header"><h1>Organizer dashboard</h1><span>5% fee · 95% yours</span></header>{children}</div></div>;
}
