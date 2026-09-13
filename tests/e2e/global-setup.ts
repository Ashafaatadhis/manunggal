import { execFileSync } from "node:child_process";
export default function globalSetup() {
  if (process.env.E2E_DATABASE !== "1") return;

  const output = execFileSync(
    process.execPath,
    ["--experimental-strip-types", "scripts/seed-e2e.ts"],
    { encoding: "utf8" },
  );
  const fixture = JSON.parse(output.trim()) as {
    email: string;
    password: string;
    draftSlug: string;
    endedSlug: string;
    foreignEventId: string;
  };

  process.env.E2E_EMAIL = fixture.email;
  process.env.E2E_PASSWORD = fixture.password;
  process.env.E2E_DRAFT_SLUG = fixture.draftSlug;
  process.env.E2E_ENDED_SLUG = fixture.endedSlug;
  process.env.E2E_FOREIGN_EVENT_ID = fixture.foreignEventId;
}
