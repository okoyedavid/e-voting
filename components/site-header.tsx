import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/events">Explore</Link>
          <Link href="/results">Results</Link>
          <Link href="/leaderboards">Leaderboards</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="nav-actions">
          <Link className="login-link" href={user ? "/dashboard" : "/login"}>{user ? "Dashboard" : "Log in"}</Link>
          <Link className="button button-primary button-sm" href={user ? "/dashboard/events/new" : "/signup"}>Create event</Link>
          <details className="mobile-menu">
            <summary aria-label="Open navigation"><Menu size={22} /></summary>
            <nav>
              <Link href="/events">Explore elections</Link>
              <Link href="/results">Recent results</Link>
              <Link href="/leaderboards">Leaderboards</Link>
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/#faq">FAQ</Link>
              <Link href={user ? "/dashboard" : "/login"}>{user ? "Dashboard" : "Organizer login"}</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
