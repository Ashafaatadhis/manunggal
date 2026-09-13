import "dotenv/config";
import { hash } from "bcryptjs";
import { db } from "../src/prisma/db.ts";
import { SEED_PASSWORD } from "../lib/seed-users.ts";
import { toInstant } from "../lib/temporal.ts";

const E2E_PASSWORD = process.env.E2E_PASSWORD || SEED_PASSWORD;
const E2E_HOST_EMAIL = "e2e-host@manunggal.local";
const E2E_FOREIGN_EMAIL = "e2e-foreign@manunggal.local";

async function findOrCreateUser(email: string, name: string) {
  const existing = await db.orm.public.User.where((user) => user.email.eq(email)).first();
  if (existing) return existing;

  return db.orm.public.User.create({
    email,
    name,
    password: await hash(E2E_PASSWORD, 12),
    role: "host",
  });
}

async function findOrCreateEvent(
  hostId: string,
  slug: string,
  status: "draft" | "ended",
) {
  const existing = await db.orm.public.Event.where((event) => event.slug.eq(slug)).first();
  if (existing) return existing;

  const date = new Date();
  const startTime = new Date("1970-01-01T10:00:00.000Z");
  const endTime = new Date("1970-01-01T18:00:00.000Z");

  return db.orm.public.Event.create({
    hostId,
    title: `E2E ${status} event`,
    slug,
    eventType: "other",
    description: "Automated E2E fixture",
    date: toInstant(date),
    startTime: toInstant(startTime),
    endTime: toInstant(endTime),
    venue: "E2E fixture venue",
    status,
  });
}

async function main() {
  const host = await findOrCreateUser(E2E_HOST_EMAIL, "E2E Host");
  const foreignHost = await findOrCreateUser(E2E_FOREIGN_EMAIL, "E2E Foreign Host");
  const draft = await findOrCreateEvent(host.id, "e2e-draft-event", "draft");
  const ended = await findOrCreateEvent(host.id, "e2e-ended-event", "ended");
  const foreignEvent = await findOrCreateEvent(
    foreignHost.id,
    "e2e-foreign-event",
    "draft",
  );

  console.log(JSON.stringify({
    email: E2E_HOST_EMAIL,
    password: E2E_PASSWORD,
    draftSlug: draft.slug,
    endedSlug: ended.slug,
    foreignEventId: foreignEvent.id,
  }));
}

try {
  await main();
} finally {
  await db.close();
}
