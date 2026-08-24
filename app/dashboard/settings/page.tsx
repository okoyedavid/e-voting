import { BadgeCheck, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const acceptance = user.terms.find((item) => item.version === "2026-01");
  return <main className="dashboard-content"><div className="dashboard-page-title"><div><h2>Account settings</h2><p>Your organizer identity and compliance records.</p></div></div><div className="dashboard-grid"><section className="dashboard-card form-stack"><div className="card-heading"><h3>Organizer profile</h3></div><label className="form-field"><span>Name</span><input defaultValue={user.name} readOnly /></label><label className="form-field"><span>Email</span><input defaultValue={user.email} readOnly /></label><button className="button button-secondary" disabled>Profile editing coming soon</button></section><section className="dashboard-card"><div className="card-heading"><h3>Agreements</h3></div><div className="trust-card" style={{ margin: 0 }}><BadgeCheck /><div><strong>Terms & fee agreement accepted</strong><span>Version 2026-01 · {acceptance?.acceptedAt.toLocaleString("en-NG") ?? "Not accepted"}</span></div></div><div className="fee-disclosure"><ShieldCheck size={18} /><span>E-voting charges 5% on successful vote transactions. Historical transaction values are never changed if event pricing changes later.</span></div></section></div></main>;
}
