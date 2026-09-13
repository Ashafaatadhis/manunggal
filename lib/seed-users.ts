export const SEED_PASSWORD = process.env.SEED_PASSWORD || "Manunggal123!";

export const SEED_USERS = [
  {
    email: "host@manunggal.local",
    name: "Demo Host",
    role: "host" as const,
  },
  {
    email: "vendor@manunggal.local",
    name: "Demo Vendor",
    role: "vendor" as const,
  },
  {
    email: "admin@manunggal.local",
    name: "Demo Admin",
    role: "admin" as const,
  },
] as const;
