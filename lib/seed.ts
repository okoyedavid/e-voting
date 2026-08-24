import "server-only";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { splitPayment } from "@/lib/money";

const eventCovers = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85",
];

const people = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=85",
];

export async function ensureSeeded() {
  if ((await db.event.count()) > 0) return;
  const owner = await db.user.upsert({
    where: { email: "demo@e-voting.ng" },
    update: {},
    create: {
      name: "Kora Events Africa",
      email: "demo@e-voting.ng",
      passwordHash: hashPassword("Demo1234!"),
      emailVerifiedAt: new Date(),
      terms: { create: { version: "2026-01" } },
      wallet: { create: { currency: "NGN" } },
    },
  });

  const now = Date.now();
  const definitions = [
    {
      name: "Lagos Creators Choice Awards",
      slug: "lagos-creators-choice-2026",
      description: "Celebrating the creators, storytellers and culture-shapers moving Lagos forward.",
      coverUrl: eventCovers[0],
      startAt: new Date(now - 2 * 86_400_000),
      endAt: new Date(now + 3 * 86_400_000 + 5 * 3_600_000),
      categories: [
        ["Creator of the Year", ["Amara Nwosu", "Tobi Adeyemi", "Zainab Bello"]],
        ["Breakout Voice", ["Ife Okafor", "Dami Cole", "Nana Mensah"]],
      ],
    },
    {
      name: "Campus Icons Awards 2026",
      slug: "campus-icons-2026",
      description: "The people who made this school year unforgettable. Your vote decides the icons.",
      coverUrl: eventCovers[1],
      startAt: new Date(now - 8 * 3_600_000),
      endAt: new Date(now + 18 * 3_600_000),
      categories: [
        ["Best Dressed", ["Emeka Okoye", "Clinton Obi", "Chidi Eze"]],
        ["Most Popular", ["Amina Yusuf", "Favour James", "Kelechi Nnamdi"]],
      ],
    },
    {
      name: "Africa Design Honours",
      slug: "africa-design-honours-2026",
      description: "Recognising bold visual thinkers designing a more beautiful African future.",
      coverUrl: eventCovers[2],
      startAt: new Date(now - 8 * 86_400_000),
      endAt: new Date(now - 3 * 3_600_000),
      categories: [["Designer of the Year", ["Sade Balogun", "Kojo Mensah", "Lerato Mokoena"]]],
    },
  ] as const;

  for (let eventIndex = 0; eventIndex < definitions.length; eventIndex++) {
    const definition = definitions[eventIndex];
    const event = await db.event.create({
      data: {
        ownerId: owner.id,
        name: definition.name,
        slug: definition.slug,
        description: definition.description,
        coverUrl: definition.coverUrl,
        visibility: "PUBLIC",
        status: eventIndex === 2 ? "ENDED" : "LIVE",
        startAt: definition.startAt,
        endAt: definition.endAt,
        pricePerVoteMinor: eventIndex === 0 ? 5000 : 10000,
        currency: "NGN",
        leaderboardVisibility: "LIVE",
        publishedAt: definition.startAt,
      },
    });
    for (let categoryIndex = 0; categoryIndex < definition.categories.length; categoryIndex++) {
      const [categoryName, names] = definition.categories[categoryIndex];
      const category = await db.category.create({
        data: {
          eventId: event.id,
          name: categoryName,
          description: `Vote for your favourite in ${categoryName}.`,
          displayOrder: categoryIndex,
        },
      });
      for (let personIndex = 0; personIndex < names.length; personIndex++) {
        const quantity = 2450 - personIndex * 310 - categoryIndex * 220 - eventIndex * 170;
        const contestant = await db.contestant.create({
          data: {
            categoryId: category.id,
            name: names[personIndex],
            description: "Community favourite with a bold story and an even brighter future.",
            imageUrl: people[(personIndex + categoryIndex * 3 + eventIndex) % people.length],
            voteTotal: quantity,
          },
        });
        const unitPrice = event.pricePerVoteMinor;
        const amounts = splitPayment(quantity * unitPrice);
        const reference = `SEED-${eventIndex}-${categoryIndex}-${personIndex}`;
        const transaction = await db.voteTransaction.create({
          data: {
            eventId: event.id,
            categoryId: category.id,
            contestantId: contestant.id,
            voterEmail: "seeded-votes@e-voting.ng",
            quantity,
            unitPriceMinor: unitPrice,
            ...amounts,
            currency: "NGN",
            paymentReference: reference,
            paymentProvider: "SEED",
            paymentStatus: "SUCCESSFUL",
            idempotencyKey: reference,
            creditedAt: new Date(),
          },
        });
        await db.voteAllocation.create({
          data: { transactionId: transaction.id, contestantId: contestant.id, quantity },
        });
      }
    }
  }

  const ended = await db.event.findUniqueOrThrow({
    where: { slug: "africa-design-honours-2026" },
    include: { categories: { include: { contestants: { orderBy: { voteTotal: "desc" } } } }, transactions: true },
  });
  const totals = ended.transactions.reduce(
    (sum, tx) => ({
      votes: sum.votes + tx.quantity,
      gross: sum.gross + tx.grossAmountMinor,
      fee: sum.fee + tx.platformFeeMinor,
      net: sum.net + tx.organizerAmountMinor,
    }),
    { votes: 0, gross: 0, fee: 0, net: 0 },
  );
  await db.$transaction(async (tx) => {
    for (const category of ended.categories) {
      for (let index = 0; index < category.contestants.length; index++) {
        const contestant = category.contestants[index];
        await tx.finalResult.create({
          data: {
            eventId: ended.id,
            categoryId: category.id,
            contestantId: contestant.id,
            position: index + 1,
            finalVotes: contestant.voteTotal,
            winningMargin: index === 0 ? contestant.voteTotal - (category.contestants[1]?.voteTotal ?? 0) : 0,
          },
        });
      }
    }
    await tx.eventSettlement.create({
      data: {
        eventId: ended.id,
        totalVotes: totals.votes,
        successfulPayments: ended.transactions.length,
        failedPayments: 0,
        grossAmountMinor: totals.gross,
        platformFeeMinor: totals.fee,
        organizerAmountMinor: totals.net,
      },
    });
    const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId: owner.id } });
    await tx.wallet.update({ where: { id: wallet.id }, data: { availableBalanceMinor: totals.net } });
    await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        type: "EVENT_EARNING",
        amountMinor: totals.net,
        balanceAfterMinor: totals.net,
        description: `Net earnings from ${ended.name} after 5% platform fee`,
        reference: `SETTLEMENT-${ended.id}`,
        eventId: ended.id,
      },
    });
  });
}
