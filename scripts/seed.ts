import "dotenv/config";
import { hash } from "bcryptjs";
import { db } from "../src/prisma/db.ts";
import { SEED_PASSWORD, SEED_USERS } from "../lib/seed-users.ts";

async function main() {
  const password = await hash(SEED_PASSWORD, 12);

  for (const seedUser of SEED_USERS) {
    const existingUser = await db.orm.public.User.where((user) =>
      user.email.eq(seedUser.email),
    ).first();

    const user = existingUser ?? await db.orm.public.User.create({
      email: seedUser.email,
      name: seedUser.name,
      password,
      role: seedUser.role,
    });

    if (seedUser.role === "vendor") {
      const existingVendor = await db.orm.public.Vendor.where((vendor) =>
        vendor.userId.eq(user.id),
      ).first();

      if (!existingVendor) {
        await db.orm.public.Vendor.create({
          userId: user.id,
          companyName: "Demo Vendor Manunggal",
          description: "Akun vendor demo untuk development.",
          branding: {},
          subscription: "free",
        });
      }
    }

    console.log(`${existingUser ? "Existing" : "Created"} ${seedUser.role}: ${seedUser.email}`);
  }

  console.log(`Seed password: ${SEED_PASSWORD}`);
}

try {
  await main();
} finally {
  await db.close();
}
