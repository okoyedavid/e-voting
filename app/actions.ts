"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const emailSchema = z.string().email().max(254).transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8).max(128);

export async function signupAction(formData: FormData) {
  const parsed = z.object({ name: z.string().trim().min(2).max(80), email: emailSchema, password: passwordSchema, terms: z.literal("on") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/signup?error=Please+complete+all+fields+and+accept+the+agreements");
  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) redirect("/login?error=An+account+already+exists+for+this+email");
  const user = await db.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash: hashPassword(parsed.data.password), terms: { create: { version: "2026-01" } }, wallet: { create: { currency: "NGN" } } } });
  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const parsed = z.object({ email: emailSchema, password: z.string() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=Enter+a+valid+email+and+password");
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) redirect("/login?error=Email+or+password+is+incorrect");
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() { await destroySession(); redirect("/"); }

export async function createEventAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.terms.some((item) => item.version === "2026-01")) redirect("/dashboard/settings?terms=required");
  const parsed = z.object({
    name: z.string().trim().min(3).max(120), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), description: z.string().trim().min(20).max(1200), startAt: z.coerce.date(), endAt: z.coerce.date(), price: z.coerce.number().int().min(50).max(1_000_000), visibility: z.enum(["PUBLIC", "UNLISTED"]), leaderboardVisibility: z.enum(["LIVE", "AFTER_END"]), publish: z.string().optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.endAt <= parsed.data.startAt) redirect("/dashboard/events/new?error=Check+the+event+details,+price,+and+date+range");
  const duplicate = await db.event.findUnique({ where: { slug: parsed.data.slug } });
  if (duplicate) redirect("/dashboard/events/new?error=That+event+URL+is+already+in+use");
  const now = new Date();
  const published = parsed.data.publish === "on";
  const status = !published ? "DRAFT" : parsed.data.startAt > now ? "UPCOMING" : parsed.data.endAt <= now ? "ENDED" : "LIVE";
  const event = await db.event.create({ data: { ownerId: user.id, name: parsed.data.name, slug: parsed.data.slug, description: parsed.data.description, startAt: parsed.data.startAt, endAt: parsed.data.endAt, pricePerVoteMinor: parsed.data.price * 100, currency: "NGN", visibility: parsed.data.visibility, leaderboardVisibility: parsed.data.leaderboardVisibility, status, publishedAt: published ? now : null } });
  redirect(`/dashboard/events/${event.id}/categories?created=1`);
}

export async function createCategoryAction(formData: FormData) {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const parsed = z.object({ eventId: z.string(), name: z.string().trim().min(2).max(100), description: z.string().trim().max(400), priceOverride: z.union([z.literal(""), z.coerce.number().int().min(50).max(1_000_000)]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid category details");
  const event = await db.event.findFirst({ where: { id: parsed.data.eventId, ownerId: user.id } }); if (!event) throw new Error("Event not found");
  await db.category.create({ data: { eventId: event.id, name: parsed.data.name, description: parsed.data.description, priceOverrideMinor: parsed.data.priceOverride === "" ? null : parsed.data.priceOverride * 100, displayOrder: await db.category.count({ where: { eventId: event.id } }) } });
  redirect(`/dashboard/events/${event.id}/categories?added=1`);
}

export async function createContestantAction(formData: FormData) {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const parsed = z.object({ eventId: z.string(), categoryId: z.string(), name: z.string().trim().min(2).max(100), description: z.string().trim().max(400), reference: z.string().trim().max(80) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid contestant details");
  const category = await db.category.findFirst({ where: { id: parsed.data.categoryId, event: { id: parsed.data.eventId, ownerId: user.id } } }); if (!category) throw new Error("Category not found");
  await db.contestant.create({ data: { categoryId: category.id, name: parsed.data.name, description: parsed.data.description, reference: parsed.data.reference || null } });
  redirect(`/dashboard/events/${parsed.data.eventId}/contestants?added=1`);
}
