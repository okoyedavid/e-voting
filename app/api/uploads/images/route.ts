import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { deleteCloudinaryImage, uploadCloudinaryImage, validateImageFile } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { cloudinaryDeliveryUrl } from "@/lib/image";
import { resolveEventStatus } from "@/lib/status";

export const runtime = "nodejs";

const targetSchema = z.object({
  entityType: z.enum(["event", "category", "contestant"]),
  entityId: z.string().min(1).max(128),
});

function validateOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) throw new Error("Cross-origin uploads are not allowed");
}

async function ownedTarget(userId: string, target: z.infer<typeof targetSchema>) {
  if (target.entityType === "event") {
    const event = await db.event.findFirst({ where: { id: target.entityId, ownerId: userId }, include: { coverImage: true } });
    if (!event) throw new Error("Event not found");
    if (resolveEventStatus(event) === "ENDED") throw new Error("Images on ended events are preserved as historical data");
    return { eventId: event.id, oldImage: event.coverImage, folder: `voting/events/${event.id}/covers`, variant: "cover" as const };
  }
  if (target.entityType === "category") {
    const category = await db.category.findFirst({ where: { id: target.entityId, event: { ownerId: userId } }, include: { imageAsset: true, event: true } });
    if (!category) throw new Error("Category not found");
    if (resolveEventStatus(category.event) === "ENDED") throw new Error("Images on ended events are preserved as historical data");
    return { eventId: category.eventId, oldImage: category.imageAsset, folder: `voting/events/${category.eventId}/categories`, variant: "cover" as const };
  }
  const contestant = await db.contestant.findFirst({ where: { id: target.entityId, category: { event: { ownerId: userId } } }, include: { imageAsset: true, category: { include: { event: true } } } });
  if (!contestant) throw new Error("Contestant not found");
  if (contestant.voteTotal > 0 || resolveEventStatus(contestant.category.event) === "ENDED") throw new Error("Contestant photos cannot change after paid votes have been recorded");
  return { eventId: contestant.category.eventId, oldImage: contestant.imageAsset, folder: `voting/events/${contestant.category.eventId}/contestants`, variant: "portrait" as const };
}

export async function POST(request: Request) {
  try {
    validateOrigin(request);
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const formData = await request.formData();
    const target = targetSchema.parse({ entityType: formData.get("entityType"), entityId: formData.get("entityId") });
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("Choose an image to upload");
    const targetData = await ownedTarget(user.id, target);
    const buffer = Buffer.from(await file.arrayBuffer());
    validateImageFile(file, buffer);
    const uploaded = await uploadCloudinaryImage(buffer, targetData.folder);
    let asset;
    try {
      asset = await db.$transaction(async (transaction) => {
        const created = await transaction.imageAsset.create({ data: { ownerId: user.id, url: uploaded.url, secureUrl: uploaded.secure_url, publicId: uploaded.public_id, width: uploaded.width, height: uploaded.height, format: uploaded.format, bytes: uploaded.bytes } });
        if (target.entityType === "event") await transaction.event.update({ where: { id: target.entityId }, data: { coverImageId: created.id, coverUrl: created.secureUrl } });
        if (target.entityType === "category") await transaction.category.update({ where: { id: target.entityId }, data: { imageAssetId: created.id, imageUrl: created.secureUrl } });
        if (target.entityType === "contestant") await transaction.contestant.update({ where: { id: target.entityId }, data: { imageAssetId: created.id, imageUrl: created.secureUrl } });
        if (targetData.oldImage) await transaction.imageAsset.delete({ where: { id: targetData.oldImage.id } });
        return created;
      });
    } catch (error) {
      await deleteCloudinaryImage(uploaded.public_id).catch(() => undefined);
      throw error;
    }
    let cleanupWarning = false;
    if (targetData.oldImage) await deleteCloudinaryImage(targetData.oldImage.publicId).catch(() => { cleanupWarning = true; });
    return NextResponse.json({ image: { ...asset, deliveryUrl: cloudinaryDeliveryUrl(asset, targetData.variant) }, cleanupWarning });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    validateOrigin(request);
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const target = targetSchema.parse(await request.json());
    const targetData = await ownedTarget(user.id, target);
    if (!targetData.oldImage) return NextResponse.json({ removed: false });
    const oldImage = targetData.oldImage;
    await db.$transaction(async (transaction) => {
      if (target.entityType === "event") await transaction.event.update({ where: { id: target.entityId }, data: { coverImageId: null, coverUrl: null } });
      if (target.entityType === "category") await transaction.category.update({ where: { id: target.entityId }, data: { imageAssetId: null, imageUrl: null } });
      if (target.entityType === "contestant") await transaction.contestant.update({ where: { id: target.entityId }, data: { imageAssetId: null, imageUrl: null } });
      await transaction.imageAsset.delete({ where: { id: oldImage.id } });
    });
    let cleanupWarning = false;
    await deleteCloudinaryImage(oldImage.publicId).catch(() => { cleanupWarning = true; });
    return NextResponse.json({ removed: true, cleanupWarning });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image removal failed" }, { status: 400 });
  }
}
