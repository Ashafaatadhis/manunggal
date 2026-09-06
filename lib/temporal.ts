import { Temporal } from "@js-temporal/polyfill";

/**
 * Prisma Next's temporal codec (`pg/timestamptz-temporal@1`) accepts a
 * `Temporal.Instant` as write input, not a `Date`. Convert a `Date` (or
 * ISO string) to the Instant the runtime expects. The polyfill is installed
 * globally in src/prisma/db.ts; this helper imports it directly so callers
 * don't depend on the global being present.
 */
export function toInstant(value: Date | string): Temporal.Instant {
  if (value instanceof Date) {
    return Temporal.Instant.fromEpochMilliseconds(value.getTime());
  }
  return Temporal.Instant.from(value);
}
