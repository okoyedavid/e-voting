"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, LockKeyhole, Mail, ShieldCheck, X } from "lucide-react";

type Selection = {
  contestantId: string;
  contestantName: string;
  contestantImage: string | null;
  categoryId: string;
  categoryName: string;
  eventSlug: string;
  eventName: string;
  unitPriceMinor: number;
  currency: string;
};

const quickAmounts = [1, 5, 10, 20, 50, 100];

export function VoteModal({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const [quantity, setQuantity] = useState(10);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"select" | "processing" | "success" | "error">("select");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const selectedQuantity = custom ? Number(custom) : quantity;
  const amountMinor = selectedQuantity * selection.unitPriceMinor;
  const formattedAmount = useMemo(() => new Intl.NumberFormat("en-NG", { style: "currency", currency: selection.currency, maximumFractionDigits: 0 }).format(amountMinor / 100), [amountMinor, selection.currency]);

  async function pay() {
    if (!email.includes("@") || !Number.isInteger(selectedQuantity) || selectedQuantity < 1 || selectedQuantity > 10_000) {
      setMessage("Enter a valid email and vote quantity between 1 and 10,000.");
      return;
    }
    setStep("processing");
    setMessage("");
    try {
      const idempotencyKey = crypto.randomUUID();
      const purchase = await fetch("/api/vote-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          eventSlug: selection.eventSlug,
          categoryId: selection.categoryId,
          contestantId: selection.contestantId,
          quantity: selectedQuantity,
          voterEmail: email,
        }),
      });
      const purchaseData = await purchase.json();
      if (!purchase.ok) throw new Error(purchaseData.error || "Unable to start payment");
      setReference(purchaseData.reference);
      if (purchaseData.checkoutUrl) {
        window.location.assign(purchaseData.checkoutUrl);
        return;
      }
      const confirmation = await fetch("/api/payments/sandbox/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: purchaseData.reference }),
      });
      const confirmationData = await confirmation.json();
      if (!confirmation.ok || !confirmationData.verified) throw new Error(confirmationData.error || "Payment could not be confirmed");
      setStep("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment could not be confirmed");
      setStep("error");
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="vote-modal" role="dialog" aria-modal="true" aria-labelledby="vote-title">
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        {step === "select" && <>
          <div className="modal-person">
            <Image src={selection.contestantImage || "/person-placeholder.svg"} alt="" width={64} height={64} />
            <div><span className="eyebrow">{selection.categoryName}</span><h2 id="vote-title">Vote for {selection.contestantName}</h2><p>{selection.eventName}</p></div>
          </div>
          <div className="modal-section">
            <div className="field-heading"><label>How many votes?</label><span>{new Intl.NumberFormat("en-NG", { style: "currency", currency: selection.currency, maximumFractionDigits: 0 }).format(selection.unitPriceMinor / 100)} each</span></div>
            <div className="vote-chips">{quickAmounts.map((amount) => <button key={amount} onClick={() => { setQuantity(amount); setCustom(""); }} className={!custom && quantity === amount ? "active" : ""}>{amount}</button>)}</div>
            <label className="custom-votes"><span>Or enter a custom amount</span><input inputMode="numeric" min="1" max="10000" placeholder="e.g. 250" value={custom} onChange={(event) => setCustom(event.target.value.replace(/\D/g, ""))} /></label>
          </div>
          <div className="modal-section">
            <label className="input-label" htmlFor="voter-email">Email address</label>
            <div className="input-with-icon"><Mail size={18} /><input id="voter-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            <span className="field-help">Used for your payment receipt only. No account needed.</span>
          </div>
          {message && <p className="form-error" role="alert">{message}</p>}
          <div className="payment-summary"><span>{selectedQuantity || 0} votes × {new Intl.NumberFormat("en-NG", { style: "currency", currency: selection.currency, maximumFractionDigits: 0 }).format(selection.unitPriceMinor / 100)}</span><strong>{formattedAmount}</strong></div>
          <button className="button button-primary button-full button-lg" onClick={pay} disabled={!selectedQuantity}>Pay {formattedAmount}</button>
          <p className="secure-note"><LockKeyhole size={14} /> Secure payment · Votes count after verification</p>
        </>}
        {step === "processing" && <div className="payment-state"><span className="processing-ring" /><span className="eyebrow">Secure verification</span><h2>Confirming your payment…</h2><p>Please keep this window open. We’re waiting for a verified response from the payment provider.</p></div>}
        {step === "success" && <div className="payment-state"><span className="success-icon"><Check /></span><span className="eyebrow success-text">Payment confirmed</span><h2>{selectedQuantity} votes added to {selection.contestantName}.</h2><p>Your votes are live on the leaderboard. A confirmation has been prepared for {email}.</p><dl><div><dt>Amount</dt><dd>{formattedAmount}</dd></div><div><dt>Reference</dt><dd>{reference}</dd></div></dl><button className="button button-primary button-full" onClick={() => window.location.reload()}>Return to event</button></div>}
        {step === "error" && <div className="payment-state"><span className="error-icon"><X /></span><span className="eyebrow error-text">Payment not confirmed</span><h2>We couldn’t confirm this payment.</h2><p>{message} No votes have been added and you can safely retry.</p><button className="button button-secondary button-full" onClick={() => setStep("select")}><ChevronLeft size={17} /> Try again</button></div>}
        <div className="provider-strip"><ShieldCheck size={16} /><span>Payment details are verified server-side</span></div>
      </section>
    </div>
  );
}
