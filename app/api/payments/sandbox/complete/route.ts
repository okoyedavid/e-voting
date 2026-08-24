import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creditVerifiedPayment } from "@/lib/payments";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_SANDBOX_PAYMENTS !== "true") {
    return NextResponse.json({ error: "Sandbox payments are disabled" }, { status: 404 });
  }
  try {
    const { reference } = await request.json() as { reference?: string };
    if (!reference) return NextResponse.json({ error: "Payment reference is required" }, { status: 400 });
    const transaction = await db.voteTransaction.findUnique({ where: { paymentReference: reference } });
    if (!transaction || transaction.paymentProvider !== "ELECTRA_SANDBOX") return NextResponse.json({ error: "Sandbox transaction not found" }, { status: 404 });
    const rawPayload = JSON.stringify({ event: "charge.success", reference, amount: transaction.grossAmountMinor, currency: transaction.currency });
    const result = await creditVerifiedPayment({ reference, providerEventId: `sandbox-${randomUUID()}`, amountMinor: transaction.grossAmountMinor, currency: transaction.currency, rawPayload });
    return NextResponse.json({ verified: true, credited: result.credited, reference });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment verification failed" }, { status: 400 });
  }
}
