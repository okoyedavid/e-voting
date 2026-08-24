import Link from "next/link";
import { BarChart3, ShieldCheck, WalletCards } from "lucide-react";
import { Logo } from "@/components/logo";
import { loginAction } from "@/app/actions";

export const metadata = { title: "Organizer login" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const error = (await searchParams).error;
  return <main className="auth-page"><section className="auth-art"><Logo light /><div className="auth-quote"><span className="eyebrow">Organizer workspace</span><h2>Your events.<br />Your audience.<br />One clear view.</h2><p>Monitor verified votes, understand event performance and see every naira from gross payment to net earnings.</p><div className="auth-points"><span><ShieldCheck size={17} /> Provider-verified vote crediting</span><span><BarChart3 size={17} /> Live competition analytics</span><span><WalletCards size={17} /> Transparent 5% fee and wallet ledger</span></div></div><small>© 2026 E-voting</small></section><section className="auth-panel"><div className="auth-form"><Logo /><h1>Welcome back.</h1><p>Sign in to manage your voting events.</p>{error && <p className="form-error">{String(error)}</p>}<form action={loginAction} className="form-stack"><label className="form-field"><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label><label className="form-field"><span>Password</span><input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required /></label><button className="button button-primary button-lg button-full">Log in to dashboard</button></form><p className="auth-switch">New to E-voting? <Link href="/signup">Create an organizer account</Link></p><p className="auth-switch">Demo: demo@e-voting.ng · Demo1234!</p></div></section></main>;
}
