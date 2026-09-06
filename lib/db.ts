// Prisma Next runtime entry point. Kept at lib/db.ts so existing `@/lib/db`
// imports keep working; the actual client lives in src/prisma/db.ts (shared
// source of truth for the contract). The `db` value is the Prisma Next
// postgres runtime — query via `db.orm.<Model>` (see .claude/skills/prisma-8).
export { db } from "@/src/prisma/db";
export type * from "@/src/prisma/contract.d";