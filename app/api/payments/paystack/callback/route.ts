import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creditVerifiedPayment } from "@/lib/payments";

type Verification = { status?: boolean; data?: { id: number | string; reference: string; amount: number; currency: string; status: string } };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference");
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!reference || !secret) return NextResponse.redirect(new URL("/payment/return?status=failed", request.url));
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" });
    const payload = await response.json() as Verification;
    if (!response.ok || !payload.status || payload.data?.status !== "success") throw new Error("Provider did not verify payment");
    const data = payload.data;
    await creditVerifiedPayment({ reference: data.reference, providerEventId: `paystack-verify-${data.id}`, amountMinor: data.amount, currency: data.currency, rawPayload: JSON.stringify(payload) });
    const transaction = await db.voteTransaction.findUnique({ where: { paymentReference: reference }, include: { event: true } });
    const destination = new URL("/payment/return", request.url);
    destination.searchParams.set("status", "successful");
    destination.searchParams.set("reference", reference);
    if (transaction) destination.searchParams.set("event", transaction.event.slug);
    return NextResponse.redirect(destination);
  } catch {
    const destination = new URL("/payment/return", request.url);
    destination.searchParams.set("status", "failed");
    destination.searchParams.set("reference", reference);
    return NextResponse.redirect(destination);
  }
}
