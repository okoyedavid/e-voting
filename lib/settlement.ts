import "server-only";
import { db } from "@/lib/db";

export async function settleExpiredEvents(now = new Date()) {
  const events = await db.event.findMany({
    where: { endAt: { lte: now }, status: { in: ["LIVE", "UPCOMING"] }, settlement: null },
    select: { id: true },
  });
  const results = [];
  for (const event of events) results.push(await settleEvent(event.id));
  return results;
}

export async function settleEvent(eventId: string) {
  return db.$transaction(async (tx) => {
    const existing = await tx.eventSettlement.findUnique({ where: { eventId } });
    if (existing) return existing;
    const event = await tx.event.findUnique({
      where: { id: eventId },
      include: {
        owner: { include: { wallet: true } },
        categories: { include: { contestants: { orderBy: [{ voteTotal: "desc" }, { createdAt: "asc" }] } } },
        transactions: true,
      },
    });
    if (!event || event.endAt > new Date()) throw new Error("Event is not ready for settlement");
    const successful = event.transactions.filter((item) => item.paymentStatus === "SUCCESSFUL");
    const totals = successful.reduce(
      (sum, item) => ({
        votes: sum.votes + item.quantity,
        gross: sum.gross + item.grossAmountMinor,
        fee: sum.fee + item.platformFeeMinor,
        net: sum.net + item.organizerAmountMinor,
      }),
      { votes: 0, gross: 0, fee: 0, net: 0 },
    );
    for (const category of event.categories) {
      for (let index = 0; index < category.contestants.length; index++) {
        const contestant = category.contestants[index];
        await tx.finalResult.create({
          data: {
            eventId,
            categoryId: category.id,
            contestantId: contestant.id,
            position: index + 1,
            finalVotes: contestant.voteTotal,
            winningMargin: index === 0 ? contestant.voteTotal - (category.contestants[1]?.voteTotal ?? 0) : 0,
          },
        });
      }
    }
    const settlement = await tx.eventSettlement.create({
      data: {
        eventId,
        totalVotes: totals.votes,
        successfulPayments: successful.length,
        failedPayments: event.transactions.filter((item) => item.paymentStatus === "FAILED").length,
        grossAmountMinor: totals.gross,
        platformFeeMinor: totals.fee,
        organizerAmountMinor: totals.net,
      },
    });
    await tx.event.update({ where: { id: eventId }, data: { status: "ENDED" } });
    const wallet = event.owner.wallet ?? await tx.wallet.create({ data: { userId: event.ownerId, currency: event.currency } });
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { availableBalanceMinor: { increment: totals.net } },
    });
    await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        type: "EVENT_EARNING",
        amountMinor: totals.net,
        balanceAfterMinor: updatedWallet.availableBalanceMinor,
        description: `Net earnings from ${event.name} after 5% platform fee`,
        reference: `SETTLEMENT-${event.id}`,
        eventId: event.id,
      },
    });
    return settlement;
  });
}
