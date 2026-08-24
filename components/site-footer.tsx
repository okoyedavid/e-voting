import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p>Fair, transparent online voting for the people and communities that matter.</p>
          <span className="footer-note">Built with care in Lagos, Nigeria.</span>
        </div>
        <div><h3>Platform</h3><Link href="/events">Explore elections</Link><Link href="/results">Results</Link><Link href="/leaderboards">Leaderboards</Link><Link href="/signup">Create event</Link></div>
        <div><h3>Project</h3><Link href="/project-info">Project Info</Link><Link href="/#about">About</Link><Link href="/#faq">FAQ</Link><Link href="mailto:hello@e-voting.ng">Contact</Link></div>
        <div><h3>Legal</h3><Link href="/terms">Terms of service</Link><Link href="/privacy">Privacy policy</Link></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 E-voting.</span><span>Secure payments · Verified votes</span></div>
    </footer>
  );
}
