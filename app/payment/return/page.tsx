import Link from "next/link";
import { Check, X } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";
export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const successful = query.status === "successful";
  const eventSlug = typeof query.event === "string" ? query.event : null;
  return <><SiteHeader /><main className="page-content"><div className="container"><section className="vote-modal" style={{ margin: "40px auto" }}><div className="payment-state"><span className={successful ? "success-icon" : "error-icon"}>{successful ? <Check /> : <X />}</span><span className={`eyebrow ${successful ? "success-text" : "error-text"}`}>{successful ? "Payment confirmed" : "Payment not confirmed"}</span><h2>{successful ? "Your votes have been added." : "We could not verify this payment."}</h2><p>{successful ? "Your verified votes are now reflected in the election results." : "No votes were credited. You can return to the event and safely try again."}</p>{query.reference && <p className="secure-note">Reference: {String(query.reference)}</p>}<Link className="button button-primary button-full" href={eventSlug ? `/events/${eventSlug}` : "/events"}>{eventSlug ? "Return to event" : "Explore elections"}</Link></div></section></div></main><SiteFooter /></>;
}
