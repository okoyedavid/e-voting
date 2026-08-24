import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { splitPayment } from "@/lib/money";
import { resolveEventStatus } from "@/lib/status";

const purchaseSchema = z.object({
  eventSlug: z.string().min(2).max(120),
  categoryId: z.string().min(1),
  contestantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10_000),
  voterEmail: z.string().email().max(254),
  idempotencyKey: z.string().min(12).max(100),
});

export async function createVotePurchase(input: unknown) {
  const parsed = purchaseSchema.parse(input);
  const existing = await db.voteTransaction.findUnique({
    where: { idempotencyKey: parsed.idempotencyKey },
  });
  if (existing) return checkoutDto(existing);

  const event = await db.event.findUnique({
    where: { slug: parsed.eventSlug },
    include: {
      categories: {
        where: { id: parsed.categoryId },
        include: { contestants: { where: { id: parsed.contestantId } } },
      },
    },
  });
  if (!event || resolveEventStatus(event) !== "LIVE") {
    throw new Error("This event is not accepting votes");
  }
  const category = event.categories[0];
  const contestant = category?.contestants[0];
  if (!category || category.status !== "ACTIVE" || !contestant || contestant.status !== "ACTIVE") {
    throw new Error("Contestant or category is not available");
  }
  const unitPriceMinor = category.priceOverrideMinor ?? event.pricePerVoteMinor;
  const gross = unitPriceMinor * parsed.quantity;
  if (!Number.isSafeInteger(gross)) throw new Error("Purchase amount is too large");
  const amounts = splitPayment(gross);
  const transaction = await db.voteTransaction.create({
    data: {
      eventId: event.id,
      categoryId: category.id,
      contestantId: contestant.id,
      voterEmail: parsed.voterEmail.toLowerCase(),
      quantity: parsed.quantity,
      unitPriceMinor,
      ...amounts,
      currency: event.currency,
      paymentReference: `EL-${Date.now().toString(36).toUpperCase()}-${randomBytes(5).toString("hex").toUpperCase()}`,
      paymentProvider: process.env.PAYSTACK_SECRET_KEY ? "PAYSTACK" : "ELECTRA_SANDBOX",
      paymentStatus: "PENDING",
      idempotencyKey: parsed.idempotencyKey,
    },
  });
  return checkoutDto(transaction);
}

function checkoutDto(transaction: {
  paymentReference: string;
  grossAmountMinor: number;
  currency: string;
  paymentStatus: string;
  paymentProvider: string;
}) {
  return {
    reference: transaction.paymentReference,
    amountMinor: transaction.grossAmountMinor,
    currency: transaction.currency,
    status: transaction.paymentStatus,
    provider: transaction.paymentProvider,
  };
}

export async function initializeProviderCheckout(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return null;
  const transaction = await db.voteTransaction.findUnique({ where: { paymentReference: reference } });
  if (!transaction) throw new Error("Transaction not found");
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: transaction.voterEmail,
      amount: transaction.grossAmountMinor,
      currency: transaction.currency,
      reference: transaction.paymentReference,
      callback_url: `${process.env.APP_URL ?? "http://localhost:3000"}/api/payments/paystack/callback`,
      metadata: { transactionId: transaction.id, eventId: transaction.eventId, contestantId: transaction.contestantId },
    }),
  });
  const payload = await response.json() as { status?: boolean; data?: { authorization_url?: string }; message?: string };
  if (!response.ok || !payload.status || !payload.data?.authorization_url) throw new Error(payload.message || "Payment provider initialization failed");
  return payload.data.authorization_url;
}

export function signWebhookBody(body: string) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) throw new Error("Payment webhook secret is not configured");
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifyWebhookSignature(body: string, signature: string | null) {
  if (!signature) return false;
  const expected = Buffer.from(signWebhookBody(body), "hex");
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function creditVerifiedPayment(input: {
  reference: string;
  providerEventId: string;
  amountMinor: number;
  currency: string;
  rawPayload: string;
}) {
  return db.$transaction(async (tx) => {
    const duplicateEvent = await tx.webhookEvent.findUnique({
      where: { providerEventId: input.providerEventId },
    });
    if (duplicateEvent) {
      const existing = await tx.voteTransaction.findUnique({
        where: { paymentReference: input.reference },
      });
      return { credited: false, alreadyProcessed: true, transaction: existing };
    }
    const transaction = await tx.voteTransaction.findUnique({
      where: { paymentReference: input.reference },
    });
    if (!transaction) throw new Error("Unknown payment reference");
    if (
      transaction.grossAmountMinor !== input.amountMinor ||
      transaction.currency !== input.currency
    ) {
      throw new Error("Verified payment amount does not match the expected amount");
    }
    await tx.webhookEvent.create({
      data: {
        provider: transaction.paymentProvider,
        providerEventId: input.providerEventId,
        reference: input.reference,
        payload: input.rawPayload,
      },
    });
    if (transaction.paymentStatus === "SUCCESSFUL") {
      return { credited: false, alreadyProcessed: true, transaction };
    }
    const updated = await tx.voteTransaction.update({
      where: { id: transaction.id },
      data: {
        paymentStatus: "SUCCESSFUL",
        providerEventId: input.providerEventId,
        creditedAt: new Date(),
      },
    });
    await tx.voteAllocation.create({
      data: {
        transactionId: transaction.id,
        contestantId: transaction.contestantId,
        quantity: transaction.quantity,
      },
    });
    await tx.contestant.update({
      where: { id: transaction.contestantId },
      data: { voteTotal: { increment: transaction.quantity } },
    });
    return { credited: true, alreadyProcessed: false, transaction: updated };
  });
}
