import 'dotenv/config';
// Prisma Next uses Temporal for `@default(now())` default generation. Node < 23
// has no global Temporal yet, so install the polyfill before the runtime runs.
import { Temporal } from '@js-temporal/polyfill';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

const g = globalThis as unknown as { Temporal?: unknown };
if (!g.Temporal) {
  g.Temporal = Temporal;
}

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
