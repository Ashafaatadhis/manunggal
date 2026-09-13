import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["host", "vendor"]).default("host"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

export const createEventSchema = z.object({
  title: z.string().min(1, "Judul acara harus diisi"),
  slug: z
    .string()
    .min(1, "Slug harus diisi")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  eventType: z.enum(["wedding", "birthday", "graduation", "corporate", "other"]),
  description: z.string().optional(),
  date: z.string().transform((v) => new Date(v)),
  startTime: z.string(),
  endTime: z.string(),
  venue: z.string().optional(),
});

export const uploadPhotoSchema = z.object({
  fileKey: z.string().min(1),
  fileUrl: z.string().url(),
  fileProvider: z.enum(["cloudinary", "s3", "r2", "local"]).default("cloudinary"),
  thumbnailUrl: z.string().url(),
  guestName: z.string().max(255).optional(),
  message: z.string().max(500).optional(),
  metadata: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      format: z.string().optional(),
      sizeBytes: z.number().optional(),
    })
    .optional(),
});

export const slideshowConfigSchema = z.object({
  intervalSec: z.number().int().min(3).max(10),
  transition: z.enum(["fade", "slide", "zoom"]),
  showMessages: z.boolean(),
});

export const slideshowCommandSchema = z.object({
  type: z.enum(["pause", "resume", "prev", "next", "stop", "config"]),
  issuedBy: z.string().optional(),
  config: slideshowConfigSchema.optional(),
});

export const eventBrandingSchema = z.object({
  branding: z.object({
    accentColor: z.string().optional(),
    logoUrl: z.string().url().nullable().optional(),
    template: z.string().optional(),
    qr: z.object({
      colorPreset: z.enum(["floral", "birthday", "ink", "blush", "forest"]),
      logoUrl: z.string().url().nullable(),
    }).optional(),
  }).strict(),
});

export const eventStatusSchema = z.object({
  status: z.enum(["active", "ended"]),
}).strict();

export const eventSettingsSchema = z.object({
  settings: z.object({
    autoApprove: z.boolean().optional(),
  }).strict(),
}).strict();

export const eventPatchSchema = z.union([
  eventBrandingSchema,
  eventStatusSchema,
  eventSettingsSchema,
]);
