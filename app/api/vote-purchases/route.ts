import { NextResponse } from "next/server";
import { createVotePurchase, initializeProviderCheckout } from "@/lib/payments";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idempotencyKey = request.headers.get("Idempotency-Key");
    if (!idempotencyKey) return NextResponse.json({ error: "Idempotency key is required" }, { status: 400 });
    const checkout = await createVotePurchase({ ...body, idempotencyKey });
    const checkoutUrl = checkout.provider === "PAYSTACK" ? await initializeProviderCheckout(checkout.reference) : null;
    return NextResponse.json({ ...checkout, checkoutUrl }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create vote purchase";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
