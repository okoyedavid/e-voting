import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { creditVerifiedPayment, verifyWebhookSignature } from "@/lib/payments";

type ProviderPayload = { event: string; data: { id: number | string; reference: string; amount: number; currency: string; status?: string } };

function verifyPaystack(body: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = Buffer.from(createHmac("sha512", secret).update(body).digest("hex"), "hex");
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
  const body = await request.text();
  const paystackSignature = request.headers.get("x-paystack-signature");
  const electraSignature = request.headers.get("x-electra-signature");
  if (!verifyPaystack(body, paystackSignature) && !verifyWebhookSignature(body, electraSignature)) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  try {
    const payload = JSON.parse(body) as ProviderPayload;
    if (payload.event !== "charge.success" || payload.data.status && payload.data.status !== "success") return NextResponse.json({ received: true, credited: false });
    const result = await creditVerifiedPayment({ reference: payload.data.reference, providerEventId: `paystack-${payload.data.id}`, amountMinor: payload.data.amount, currency: payload.data.currency, rawPayload: body });
    return NextResponse.json({ received: true, credited: result.credited, duplicate: result.alreadyProcessed });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, { status: 400 });
  }
}
