# Manunggal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Manunggal, a real-time shared photo album SaaS for any event, from foundation through MVP guest features.

**Architecture:** Next.js monolith on Vercel with PostgreSQL (Prisma ORM) on VPS, Cloudinary for media (direct client upload via signed URLs), Redis for SSE pub/sub, and Server-Sent Events for real-time photo streaming.

**Tech Stack:** Next.js 14+ (App Router, TypeScript), Tailwind CSS, Prisma, PostgreSQL, Redis, Cloudinary, jose (JWT), bcryptjs, qrcode

## Global Constraints

- TypeScript strict mode enabled
- Tailwind CSS for all styling (no CSS modules)
- Inter font for headings and body
- Color palette: Blush #D4A574, Cream #FDF6EC, Gold #C9A96E
- No em dashes in typography
- Mobile-first responsive design (breakpoints: 640px, 1024px)
- JWT tokens via jose library (7-day expiry)
- UUID primary keys via Prisma `@default(uuid())`
- API response format: `{ success: boolean, data?: T, error?: { code: string, message: string } }`

---

## File Structure

```
manunggal/
├── prisma/
│   └── schema.prisma
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── harga/page.tsx
│   │   ├── cara-kerja/page.tsx
│   │   └── faq/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── host/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── events/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           ├── photos/page.tsx
│   │           ├── moderation/page.tsx
│   │           ├── qr/page.tsx
│   │           └── settings/page.tsx
│   ├── g/
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── camera/page.tsx
│   │       ├── upload/page.tsx
│   │       └── feed/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── events/
│       │   ├── route.ts
│       │   ├── [slug]/route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── status/route.ts
│       │       ├── photos/route.ts
│       │       ├── photos/bulk/route.ts
│       │       ├── upload-signature/route.ts
│       │       ├── stream/route.ts
│       │       ├── qr/route.ts
│       │       └── download/route.ts
│       └── photos/
│           └── [id]/
│               ├── route.ts
│               └── status/route.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   └── LoadingSpinner.tsx
│   ├── host/
│   │   ├── EventCard.tsx
│   │   ├── EventForm.tsx
│   │   ├── PhotoGrid.tsx
│   │   ├── ModerationQueue.tsx
│   │   ├── QRGenerator.tsx
│   │   └── StatsCard.tsx
│   ├── guest/
│   │   ├── CameraCapture.tsx
│   │   ├── GalleryUpload.tsx
│   │   ├── LiveFeed.tsx
│   │   ├── PhotoCard.tsx
│   │   ├── WishForm.tsx
│   │   └── NameInput.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── db.ts
│   ├── redis.ts
│   ├── cloudinary.ts
│   ├── auth.ts
│   ├── sse.ts
│   ├── utils.ts
│   └── validations.ts
├── hooks/
│   ├── useSSE.ts
│   ├── useUpload.ts
│   └── useCamera.ts
├── middleware.ts
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## Phase 0: Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

**Dependencies:** next, react, react-dom, typescript, @types/node, @types/react, @types/react-dom, tailwindcss, postcss, autoprefixer

- [ ] **Step 1: Create Next.js project**

```bash
npx create-next-app@latest manunggal --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
cd manunggal
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install prisma @prisma/client jose bcryptjs qrcode
npm install -D @types/bcryptjs @types/qrcode
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```
Expected: Server starts at http://localhost:3000

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: initialize next.js project with typescript and tailwind"
```

---

### Task 2: Configure Tailwind with Design Tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts with Manunggal colors**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#FEF7F0",
          100: "#FDEADB",
          200: "#F9D1B5",
          300: "#F2B48A",
          400: "#D4A574",
          500: "#C9956A",
          600: "#B07D52",
          700: "#8D6441",
          800: "#6B4C31",
          900: "#483320",
        },
        cream: {
          50: "#FFFDF9",
          100: "#FDF6EC",
          200: "#FBF0E0",
          300: "#F5E5CC",
          400: "#EDD9B8",
          500: "#E5CDA4",
          600: "#D4B88A",
          700: "#B89B6C",
          800: "#9C7F50",
          900: "#7A633E",
        },
        gold: {
          50: "#FBF6ED",
          100: "#F5ECD8",
          200: "#ECDDB5",
          300: "#DFCA8E",
          400: "#C9A96E",
          500: "#B89555",
          600: "#9A7B44",
          700: "#7C6236",
          800: "#5E4A29",
          900: "#40321C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["3rem", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["1.875rem", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        h4: ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Update app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans text-gray-800 bg-cream-100;
  }

  h1 { @apply text-h1; }
  h2 { @apply text-h2; }
  h3 { @apply text-h3; }
  h4 { @apply text-h4; }
}
```

- [ ] **Step 3: Verify colors render correctly**

Update `app/page.tsx` to show a test with the blush color:
```tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-hero text-blush-400">Manunggal</h1>
        <p className="text-gray-600 mt-4">Album digital real-time untuk semua acaramu</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css app/page.tsx
git commit -m "feat: add manunggal design tokens and color palette"
```

---

### Task 3: Setup Prisma and PostgreSQL

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`
- Create: `.env.example`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init
```

- [ ] **Step 2: Write prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  host
  vendor
  admin
}

enum EventStatus {
  draft
  active
  live
  ended
}

enum EventType {
  wedding
  birthday
  graduation
  corporate
  other
}

enum PhotoStatus {
  pending
  approved
  hidden
  deleted
}

enum OrderStatus {
  pending
  paid
  expired
  cancelled
}

enum PackageType {
  free
  pro_event
  vendor_monthly
  vendor_yearly
}

enum VendorSubscription {
  free
  pro
  enterprise
}

enum FileProvider {
  cloudinary
  s3
  r2
  local
}

model User {
  id         String   @id @default(uuid())
  email      String   @unique
  name       String
  password   String
  role       UserRole @default(host)
  phone      String?
  avatarUrl  String?  @map("avatar_url")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  events Event[]
  orders Order[]

  vendor Vendor?

  @@map("users")
}

model Vendor {
  id           String             @id @default(uuid())
  userId       String             @unique @map("user_id")
  companyName  String             @map("company_name")
  logoUrl      String?            @map("logo_url")
  description  String?
  branding     Json               @default("{}")
  subscription VendorSubscription @default(free)
  maxEvents    Int?               @map("max_events")
  createdAt    DateTime           @default(now()) @map("created_at")
  updatedAt    DateTime           @updatedAt @map("updated_at")

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  events Event[]

  @@map("vendors")
}

model Event {
  id          String      @id @default(uuid())
  hostId      String      @map("host_id")
  vendorId    String?     @map("vendor_id")
  title       String
  slug        String      @unique
  eventType   EventType   @map("event_type")
  description String?
  date        DateTime    @db.Date
  startTime   DateTime    @map("start_time")
  endTime     DateTime    @map("end_time")
  venue       String?
  status      EventStatus @default(draft)
  settings    Json        @default("{}")
  branding    Json        @default("{}")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  host   User     @relation(fields: [hostId], references: [id], onDelete: Cascade)
  vendor Vendor?  @relation(fields: [vendorId], references: [id], onDelete: SetNull)
  photos Photo[]
  orders Order[]

  @@index([hostId])
  @@index([slug])
  @@index([status])
  @@index([date])
  @@map("events")
}

model Photo {
  id            String       @id @default(uuid())
  eventId       String       @map("event_id")
  fileKey       String       @map("file_key")
  fileUrl       String       @map("file_url")
  fileProvider  FileProvider @default(cloudinary) @map("file_provider")
  thumbnailUrl  String       @map("thumbnail_url")
  guestName     String?      @map("guest_name")
  guestIp       String?      @map("guest_ip")
  message       String?
  status        PhotoStatus  @default(pending)
  metadata      Json         @default("{}")
  uploadedAt    DateTime     @default(now()) @map("uploaded_at")
  moderatedAt   DateTime?    @map("moderated_at")

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@index([status])
  @@index([uploadedAt])
  @@map("photos")
}

model Order {
  id             String      @id @default(uuid())
  eventId        String      @map("event_id")
  userId         String      @map("user_id")
  amount         Int
  package        PackageType
  status         OrderStatus @default(pending)
  paymentMethod  String?     @map("payment_method")
  paymentProofUrl String?    @map("payment_proof_url")
  paidAt         DateTime?   @map("paid_at")
  expiresAt      DateTime?   @map("expires_at")
  createdAt      DateTime    @default(now()) @map("created_at")

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@index([userId])
  @@map("orders")
}
```

- [ ] **Step 3: Create lib/db.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 4: Create .env.example**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/manunggal"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret-here"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

- [ ] **Step 5: Run Prisma generate and push**

```bash
npx prisma generate
npx prisma db push
```
Expected: Schema pushed to database successfully

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma lib/db.ts .env.example
git commit -m "feat: setup prisma schema with all tables"
```

---

### Task 4: Setup Redis Connection

**Files:**
- Create: `lib/redis.ts`
- Create: `.env.local` (add REDIS_URL)

**Dependencies:** ioredis

- [ ] **Step 1: Install ioredis**

```bash
npm install ioredis
npm install -D @types/ioredis
```

- [ ] **Step 2: Create lib/redis.ts**

```typescript
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  return new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
```

- [ ] **Step 3: Verify Redis connection**

```bash
node -e "const Redis = require('ioredis'); const r = new Redis(); r.ping().then(() => { console.log('Redis connected'); r.quit(); }).catch(e => { console.error('Redis error:', e.message); r.quit(); })"
```
Expected: "Redis connected"

- [ ] **Step 4: Commit**

```bash
git add lib/redis.ts .env.local
git commit -m "feat: add redis connection helper"
```

---

### Task 5: Setup Cloudinary Integration

**Files:**
- Create: `lib/cloudinary.ts`

**Dependencies:** cloudinary

- [ ] **Step 1: Install cloudinary**

```bash
npm install cloudinary
```

- [ ] **Step 2: Create lib/cloudinary.ts**

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function generateUploadSignature(eventId: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `manunggal/events/${eventId}`;
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const paramsToSign = {
    timestamp,
    folder,
    ...(maxFileSize && { eager: "w_2048,h_2048,c_limit,q_85,f_auto" }),
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    maxFileSize,
  };
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export function getThumbnailUrl(url: string, width = 300) {
  // Cloudinary URL transformation for thumbnails
  return url.replace("/upload/", `/upload/w_${width},h_${width},c_fill,f_auto/`);
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/cloudinary.ts
git commit -m "feat: add cloudinary helpers for signed uploads"
```

---

### Task 6: Setup JWT Authentication

**Files:**
- Create: `lib/auth.ts`
- Create: `lib/validations.ts`
- Create: `middleware.ts`
- Create: `app/api/auth/register/route.ts`
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/me/route.ts`

**Dependencies:** jose, bcryptjs

- [ ] **Step 1: Create lib/validations.ts**

```typescript
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
  slug: z.string().min(1, "Slug harus diisi").regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
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
  metadata: z.object({}).optional(),
});
```

- [ ] **Step 2: Install zod**

```bash
npm install zod
```

- [ ] **Step 3: Create lib/auth.ts**

```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
```

- [ ] **Step 4: Create app/api/auth/register/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_EXISTS", message: "Email sudah terdaftar" } },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(data.password, 12);

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: Create app/api/auth/login/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah" } },
        { status: 401 }
      );
    }

    const isValidPassword = await compare(data.password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah" } },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 6: Create app/api/auth/me/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Tidak terautentikasi" } },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "User tidak ditemukan" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 7: Create middleware.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const protectedRoutes = ["/host"];
const authRoutes = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    const session = await verifyToken(token);
    if (session) {
      const url = req.nextUrl.clone();
      url.pathname = "/host";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/host/:path*", "/login", "/register"],
};
```

- [ ] **Step 8: Commit**

```bash
git add lib/auth.ts lib/validations.ts middleware.ts app/api/auth/
git commit -m "feat: add authentication system with JWT"
```

---

### Task 7: Create Base UI Components

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Input.tsx`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Modal.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/LoadingSpinner.tsx`

- [ ] **Step 1: Create components/ui/Button.tsx**

```tsx
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-blush-400 text-white hover:bg-blush-500 focus:ring-blush-400",
      secondary: "bg-cream-200 text-gray-800 hover:bg-cream-300 focus:ring-cream-400",
      ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
```

- [ ] **Step 2: Create components/ui/Input.tsx**

```tsx
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blush-400 focus:border-transparent transition-colors ${
            error ? "border-red-500" : "border-gray-200"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
```

- [ ] **Step 3: Create components/ui/Card.tsx**

```tsx
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export default function Card({ className = "", variant = "default", children, ...props }: CardProps) {
  const variants = {
    default: "bg-white border border-gray-100",
    elevated: "bg-white shadow-md",
  };

  return (
    <div className={`rounded-xl ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create components/ui/Modal.tsx**

```tsx
"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-black/50 rounded-xl p-0 max-w-md w-full"
    >
      <div className="p-6">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h4 text-gray-800">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </dialog>
  );
}
```

- [ ] **Step 5: Create components/ui/Badge.tsx**

```tsx
interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error";
  children: React.ReactNode;
}

export default function Badge({ variant = "default", children }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 6: Create components/ui/LoadingSpinner.tsx**

```tsx
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        className={`animate-spin text-blush-400 ${sizes[size]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/ui/
git commit -m "feat: add base ui components (Button, Input, Card, Modal, Badge, Spinner)"
```

---

### Task 8: Create Layout Components

**Files:**
- Create: `components/shared/Header.tsx`
- Create: `components/shared/Footer.tsx`
- Create: `app/(marketing)/layout.tsx`
- Create: `app/(marketing)/page.tsx`
- Create: `app/(marketing)/harga/page.tsx`
- Create: `app/(marketing)/cara-kerja/page.tsx`

- [ ] **Step 1: Create components/shared/Header.tsx**

```tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blush-400">
            Manunggal
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/cara-kerja" className="text-gray-600 hover:text-gray-900">
              Cara Kerja
            </Link>
            <Link href="/harga" className="text-gray-600 hover:text-gray-900">
              Harga
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Masuk
            </Link>
            <Link href="/register" className="bg-blush-400 text-white px-4 py-2 rounded-lg hover:bg-blush-500">
              Coba Gratis
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create components/shared/Footer.tsx**

```tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 text-sm">
            © 2026 Manunggal. Album digital real-time untuk semua acaramu.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://instagram.com" className="text-gray-400 hover:text-gray-600">
              Instagram
            </a>
            <a href="https://tiktok.com" className="text-gray-400 hover:text-gray-600">
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create app/(marketing)/layout.tsx**

```tsx
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Create app/(marketing)/page.tsx**

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-cream-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-hero text-gray-900 mb-6">
            Album Digital Real-Time
            <br />
            <span className="text-blush-400">untuk Semua Acaramu</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Scan, foto, langsung muncul di TV. Tanpa app, tanpa ribet.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blush-400 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blush-500 transition-colors"
          >
            Coba Gratis Sekarang
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-h2 text-center text-gray-900 mb-12">Cara Kerja</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Bikin Event", desc: "Isi nama acara, tanggal, QR langsung jadi" },
              { step: "2", title: "Share QR", desc: "Cetak atau kirim link ke tamu" },
              { step: "3", title: "Tamu Foto", desc: "Scan QR, foto langsung muncul" },
              { step: "4", title: "Live di TV", desc: "Tayangkan slideshow di venue" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blush-100 text-blush-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-h4 text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Create app/(marketing)/harga/page.tsx**

```tsx
import Link from "next/link";

export default function HargaPage() {
  const packages = [
    {
      name: "Free",
      price: "Rp 0",
      features: ["50 foto", "Akses 7 hari", "Live feed", "Tanpa watermark"],
      cta: "Mulai Gratis",
      primary: false,
    },
    {
      name: "Pro Event",
      price: "Rp 200rb",
      features: ["Unlimited foto", "Penyimpanan 1 tahun", "Live slideshow", "Bulk download ZIP", "Tanpa watermark", "Moderasi konten"],
      cta: "Pilih Pro",
      primary: true,
    },
    {
      name: "Vendor",
      price: "Hubungi Kami",
      features: ["Unlimited events", "Custom branding", "Dashboard vendor", "Support prioritas", "Semua fitur Pro"],
      cta: "Jadi Partner",
      primary: false,
    },
  ];

  return (
    <div className="py-20 px-4 bg-cream-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-h1 text-center text-gray-900 mb-4">Harga</h1>
        <p className="text-center text-gray-600 mb-12">Pilih paket sesuai kebutuhan acaramu</p>
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`rounded-xl p-8 ${
                pkg.primary ? "bg-blush-400 text-white ring-4 ring-blush-300" : "bg-white"
              }`}
            >
              <h3 className={`text-h3 mb-2 ${pkg.primary ? "text-white" : "text-gray-900"}`}>
                {pkg.name}
              </h3>
              <p className={`text-3xl font-bold mb-6 ${pkg.primary ? "text-white" : "text-gray-900"}`}>
                {pkg.price}
              </p>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className={`w-5 h-5 mr-2 ${pkg.primary ? "text-white" : "text-blush-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={pkg.primary ? "text-white" : "text-gray-600"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center py-3 rounded-lg font-medium transition-colors ${
                  pkg.primary
                    ? "bg-white text-blush-400 hover:bg-cream-100"
                    : "bg-blush-100 text-blush-500 hover:bg-blush-200"
                }`}
              >
                {pkg.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create app/(marketing)/cara-kerja/page.tsx**

```tsx
export default function CaraKerjaPage() {
  return (
    <div className="py-20 px-4 bg-cream-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-h1 text-center text-gray-900 mb-4">Cara Kerja</h1>
        <p className="text-center text-gray-600 mb-16">Empat langkah, selesai.</p>

        <div className="space-y-16">
          {[
            {
              step: 1,
              title: "Bikin Event Kamu",
              desc: "Pilih tanggal, isi nama acara, atur jatah foto per tamu. QR langsung jadi dalam hitungan menit.",
            },
            {
              step: 2,
              title: "Bagikan Lewat QR",
              desc: "Kartu QR siap cetak atau share link via WhatsApp. Tamu tinggal scan, nggak perlu install app.",
            },
            {
              step: 3,
              title: "Tamu Motret",
              desc: "Tamu jepret kapan aja selama acara. Bisa dari kamera atau upload dari galeri HP.",
            },
            {
              step: 4,
              title: "Live di TV",
              desc: "Foto langsung muncul di live feed. Tayangkan slideshow di proyektor atau TV venue.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-8 items-start">
              <div className="w-16 h-16 bg-blush-100 text-blush-500 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h2 className="text-h2 text-gray-900 mb-2">{item.title}</h2>
                <p className="text-gray-600 text-lg">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/shared/ app/(marketing)/
git commit -m "feat: add marketing pages (homepage, pricing, how it works)"
```

---

## Phase 1: Guest Core

### Task 9: Create Guest Landing Page and QR Code

**Files:**
- Create: `app/g/[slug]/page.tsx`
- Create: `app/api/events/[slug]/route.ts`
- Create: `components/guest/NameInput.tsx`
- Create: `lib/qrcode.ts`

**Dependencies:** qrcode

- [ ] **Step 1: Create lib/qrcode.ts**

```typescript
import QRCode from "qrcode";

export async function generateQRCode(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 300,
    margin: 2,
    color: {
      dark: "#1F2937",
      light: "#FFFFFF",
    },
  });
}
```

- [ ] **Step 2: Create app/api/events/[slug]/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const event = await db.event.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        title: true,
        slug: true,
        eventType: true,
        date: true,
        startTime: true,
        endTime: true,
        venue: true,
        status: true,
        branding: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { code: "EVENT_NOT_FOUND", message: "Event tidak ditemukan" } },
        { status: 404 }
      );
    }

    if (event.status === "draft") {
      return NextResponse.json(
        { success: false, error: { code: "EVENT_NOT_ACTIVE", message: "Event belum aktif" } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: event });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create components/guest/NameInput.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";

interface NameInputProps {
  onNameSet: (name: string) => void;
}

export default function NameInput({ onNameSet }: NameInputProps) {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("guestName");
    if (stored) {
      setSavedName(stored);
      onNameSet(stored);
    }
  }, [onNameSet]);

  const handleSubmit = () => {
    if (name.trim()) {
      localStorage.setItem("guestName", name.trim());
      onNameSet(name.trim());
    }
  };

  const handleSkip = () => {
    onNameSet("Anonymous");
  };

  if (savedName) {
    return (
      <div className="text-center">
        <p className="text-gray-600">
          Halo, <span className="font-medium text-gray-800">{savedName}</span>!
          <button
            onClick={() => {
              localStorage.removeItem("guestName");
              setSavedName(null);
            }}
            className="ml-2 text-blush-400 hover:text-blush-500 text-sm"
          >
            Ganti nama
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Siapa kamu? (opsional)
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Masukkan namamu"
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blush-400 mb-3"
      />
      <div className="flex gap-3">
        <button
          onClick={handleSkip}
          className="flex-1 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Lewati
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-blush-400 text-white rounded-lg hover:bg-blush-500"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create app/g/[slug]/page.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NameInput from "@/components/guest/NameInput";

export default function GuestLandingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${slug}`);
        const data = await res.json();
        if (data.success) {
          setEvent(data.data);
        } else {
          setError(data.error.message);
        }
      } catch {
        setError("Gagal memuat acara");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blush-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4">
      <div className="max-w-sm mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-h2 text-gray-900 mb-2">{event.title}</h1>
          <p className="text-gray-600">
            {new Date(event.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <NameInput onNameSet={setGuestName} />
        </div>

        {guestName && (
          <div className="space-y-4">
            <button
              onClick={() => router.push(`/g/${slug}/camera`)}
              className="w-full bg-blush-400 text-white py-4 rounded-xl text-lg font-medium hover:bg-blush-500 transition-colors"
            >
              📸 Mulai Motret
            </button>
            <button
              onClick={() => router.push(`/g/${slug}/upload`)}
              className="w-full bg-white text-gray-700 py-4 rounded-xl text-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              🖼️ Pilih dari Galeri
            </button>
            <button
              onClick={() => router.push(`/g/${slug}/feed`)}
              className="w-full text-blush-400 py-4 text-lg font-medium hover:text-blush-500 transition-colors"
            >
              📷 Lihat Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/g/ components/guest/NameInput.tsx lib/qrcode.ts app/api/events/[slug]/
git commit -m "feat: add guest landing page with name input"
```

---

### Task 10: Create Upload Signature API

**Files:**
- Create: `app/api/events/[id]/upload-signature/route.ts`

- [ ] **Step 1: Create upload-signature API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await db.event.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { code: "EVENT_NOT_FOUND", message: "Event tidak ditemukan" } },
        { status: 404 }
      );
    }

    if (event.status === "ended") {
      return NextResponse.json(
        { success: false, error: { code: "EVENT_ENDED", message: "Acara sudah berakhir" } },
        { status: 403 }
      );
    }

    const signature = generateUploadSignature(event.id);

    return NextResponse.json({ success: true, data: signature });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/events/[id]/upload-signature/
git commit -m "feat: add upload signature API for direct cloudinary upload"
```

---

### Task 11: Create Photo Upload API

**Files:**
- Create: `app/api/events/[eventId]/photos/route.ts`
- Create: `lib/redis.ts` (add publish function)

- [ ] **Step 1: Add publish helper to lib/redis.ts**

```typescript
export async function publishPhoto(eventId: string, photo: any) {
  await redis.publish(`event:${eventId}:photos`, JSON.stringify({
    type: "photo:new",
    data: photo,
  }));
}

export async function publishModeration(eventId: string, photoId: string, action: string) {
  await redis.publish(`event:${eventId}:photos`, JSON.stringify({
    type: `photo:${action}`,
    data: { photoId },
  }));
}
```

- [ ] **Step 2: Create app/api/events/[eventId]/photos/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadPhotoSchema } from "@/lib/validations";
import { publishPhoto } from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await db.event.findUnique({
      where: { id: params.eventId },
      select: { id: true, status: true, settings: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { code: "EVENT_NOT_FOUND", message: "Event tidak ditemukan" } },
        { status: 404 }
      );
    }

    const settings = event.settings as any;
    const isGuest = !req.cookies.get("token")?.value;

    const where: any = {
      eventId: params.eventId,
      status: isGuest ? "approved" : { not: "deleted" },
    };

    const photos = await db.photo.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: photos });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await db.event.findUnique({
      where: { id: params.eventId },
      select: { id: true, status: true, settings: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { code: "EVENT_NOT_FOUND", message: "Event tidak ditemukan" } },
        { status: 404 }
      );
    }

    if (event.status === "ended") {
      return NextResponse.json(
        { success: false, error: { code: "EVENT_ENDED", message: "Acara sudah berakhir" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = uploadPhotoSchema.parse(body);

    const settings = event.settings as any;
    const autoApprove = settings.autoApprove || false;

    const photo = await db.photo.create({
      data: {
        eventId: params.eventId,
        fileKey: data.fileKey,
        fileUrl: data.fileUrl,
        fileProvider: data.fileProvider,
        thumbnailUrl: data.thumbnailUrl,
        guestName: data.guestName,
        guestIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        message: data.message,
        status: autoApprove ? "approved" : "pending",
        metadata: data.metadata || {},
      },
    });

    // Publish to SSE if auto-approved
    if (autoApprove) {
      await publishPhoto(params.eventId, photo);
    }

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/events/[eventId]/photos/ lib/redis.ts
git commit -m "feat: add photo upload API with moderation and SSE publish"
```

---

### Task 12: Create Camera Capture Component

**Files:**
- Create: `components/guest/CameraCapture.tsx`
- Create: `hooks/useCamera.ts`
- Create: `app/g/[slug]/camera/page.tsx`

- [ ] **Step 1: Create hooks/useCamera.ts**

```typescript
"use client";

import { useRef, useState, useCallback } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [photo, setPhoto] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPhoto(dataUrl);
    return dataUrl;
  }, []);

  const flipCamera = useCallback(() => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, [stopCamera]);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
  }, []);

  return {
    videoRef,
    canvasRef,
    photo,
    startCamera,
    stopCamera,
    takePhoto,
    flipCamera,
    clearPhoto,
    facingMode,
  };
}
```

- [ ] **Step 2: Create components/guest/CameraCapture.tsx**

```tsx
"use client";

import { useEffect } from "react";
import { useCamera } from "@/hooks/useCamera";

interface CameraCaptureProps {
  onCapture: (photo: string) => void;
  onBack: () => void;
}

export default function CameraCapture({ onCapture, onBack }: CameraCaptureProps) {
  const { videoRef, canvasRef, photo, startCamera, stopCamera, takePhoto, flipCamera, clearPhoto } =
    useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    const photoData = takePhoto();
    if (photoData) {
      onCapture(photoData);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <canvas ref={canvasRef} className="hidden" />

      {photo ? (
        <div className="relative w-full h-full">
          <img src={photo} alt="Captured" className="w-full h-full object-cover" />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={clearPhoto}
              className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-xl"
            >
              ❌ Hapus
            </button>
            <button
              onClick={() => onCapture(photo)}
              className="px-6 py-3 bg-blush-400 text-white rounded-xl font-medium"
            >
              📤 Kirim
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <button
              onClick={onBack}
              className="p-2 bg-black/30 backdrop-blur text-white rounded-full"
            >
              ←
            </button>
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
            <button
              onClick={flipCamera}
              className="p-4 bg-black/30 backdrop-blur text-white rounded-full"
            >
              🔄
            </button>
            <button
              onClick={handleCapture}
              className="w-20 h-20 bg-white rounded-full border-4 border-white/50 active:scale-95 transition-transform"
            />
            <div className="w-12" /> {/* Spacer */}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create app/g/[slug]/camera/page.tsx**

```tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CameraCapture from "@/components/guest/CameraCapture";
import WishForm from "@/components/guest/WishForm";

export default function CameraPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const handleCapture = (photo: string) => {
    setCapturedPhoto(photo);
  };

  const handleBack = () => {
    router.push(`/g/${slug}`);
  };

  if (capturedPhoto) {
    return (
      <WishForm
        photo={capturedPhoto}
        eventId={slug}
        onBack={() => setCapturedPhoto(null)}
        onSuccess={() => router.push(`/g/${slug}/feed`)}
      />
    );
  }

  return <CameraCapture onCapture={handleCapture} onBack={handleBack} />;
}
```

- [ ] **Step 4: Create components/guest/WishForm.tsx**

```tsx
"use client";

import { useState } from "react";

interface WishFormProps {
  photo: string;
  eventId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function WishForm({ photo, eventId, onBack, onSuccess }: WishFormProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    setUploading(true);

    try {
      // 1. Get upload signature
      const sigRes = await fetch(`/api/events/${eventId}/upload-signature`);
      const sigData = await sigRes.json();

      if (!sigData.success) throw new Error("Failed to get upload signature");

      const { timestamp, signature, apiKey, cloudName, folder } = sigData.data;

      // 2. Convert base64 to blob
      const response = await fetch(photo);
      const blob = await response.blob();
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

      // 3. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadData = await uploadRes.json();

      // 4. Save metadata to database
      const guestName = localStorage.getItem("guestName") || "Anonymous";

      await fetch(`/api/events/${eventId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKey: uploadData.public_id,
          fileUrl: uploadData.secure_url,
          fileProvider: "cloudinary",
          thumbnailUrl: uploadData.secure_url,
          guestName,
          message: message || undefined,
          metadata: {
            width: uploadData.width,
            height: uploadData.height,
            format: uploadData.format,
          },
        }),
      });

      onSuccess();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 py-8 px-4">
      <div className="max-w-sm mx-auto">
        <button onClick={onBack} className="mb-6 text-gray-600 hover:text-gray-800">
          ← Kembali
        </button>

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <img
            src={photo}
            alt="Captured"
            className="w-full rounded-xl aspect-[3/4] object-cover"
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tulis ucapan atau doa (opsional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Selamat ya! Semoga bahagia selalu 🎉"
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blush-400 resize-none mb-4"
          />
          <p className="text-xs text-gray-400 mb-4">{message.length}/500</p>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full bg-blush-400 text-white py-3 rounded-xl font-medium hover:bg-blush-500 disabled:opacity-50"
          >
            {uploading ? "Mengunggah..." : "📤 Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/guest/CameraCapture.tsx components/guest/WishForm.tsx hooks/useCamera.ts app/g/[slug]/camera/
git commit -m "feat: add camera capture and wish form for photo upload"
```

---

### Task 13: Create Gallery Upload Component

**Files:**
- Create: `components/guest/GalleryUpload.tsx`
- Create: `app/g/[slug]/upload/page.tsx`

- [ ] **Step 1: Create components/guest/GalleryUpload.tsx**

```tsx
"use client";

import { useState, useRef } from "react";

interface GalleryUploadProps {
  eventId: string;
  onSuccess: () => void;
}

export default function GalleryUpload({ eventId, onSuccess }: GalleryUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 10) {
      alert("Maksimal 10 foto per upload");
      return;
    }

    setFiles(selectedFiles);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      // Get upload signature
      const sigRes = await fetch(`/api/events/${eventId}/upload-signature`);
      const sigData = await sigRes.json();
      if (!sigData.success) throw new Error("Failed to get signature");

      const { timestamp, signature, apiKey, cloudName, folder } = sigData.data;
      const guestName = localStorage.getItem("guestName") || "Anonymous";

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        const uploadData = await uploadRes.json();

        // Save metadata
        await fetch(`/api/events/${eventId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileKey: uploadData.public_id,
            fileUrl: uploadData.secure_url,
            fileProvider: "cloudinary",
            thumbnailUrl: uploadData.secure_url,
            guestName,
            message: message || undefined,
            metadata: {
              width: uploadData.width,
              height: uploadData.height,
              format: uploadData.format,
            },
          }),
        });

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      onSuccess();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 py-8 px-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-h3 text-gray-900 mb-6">Pilih Foto dari Galeri</h1>

        {files.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-16 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-blush-400 hover:text-blush-400 transition-colors"
          >
            <div className="text-4xl mb-2">🖼️</div>
            <div>Ketuk untuk memilih foto</div>
            <div className="text-sm mt-1">Maksimal 10 foto</div>
          </button>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {previews.map((preview, i) => (
                <img
                  key={i}
                  src={preview}
                  alt={`Preview ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tulis ucapan (opsional, berlaku untuk semua foto)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Selamat ya! 🎉"
                maxLength={500}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blush-400 resize-none"
              />
            </div>

            {uploading && (
              <div className="mb-6">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blush-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Mengunggah {progress}%
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blush-400 text-white py-3 rounded-xl font-medium hover:bg-blush-500 disabled:opacity-50"
            >
              {uploading ? "Mengunggah..." : `📤 Upload ${files.length} Foto`}
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create app/g/[slug]/upload/page.tsx**

```tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import GalleryUpload from "@/components/guest/GalleryUpload";

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  return (
    <GalleryUpload
      eventId={slug}
      onSuccess={() => router.push(`/g/${slug}/feed`)}
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/guest/GalleryUpload.tsx app/g/[slug]/upload/
git commit -m "feat: add gallery upload with multi-select and progress bar"
```

---

### Task 14: Create SSE Stream and Live Feed

**Files:**
- Create: `app/api/events/[eventId]/stream/route.ts`
- Create: `hooks/useSSE.ts`
- Create: `components/guest/LiveFeed.tsx`
- Create: `components/guest/PhotoCard.tsx`
- Create: `app/g/[slug]/feed/page.tsx`

- [ ] **Step 1: Create app/api/events/[eventId]/stream/route.ts**

```typescript
import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Subscribe to Redis channel
      const subscriber = redis.duplicate();
      subscriber.subscribe(`event:${params.eventId}:photos`);

      subscriber.on("message", (channel, message) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`));
      });

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        subscriber.unsubscribe();
        subscriber.quit();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 2: Create hooks/useSSE.ts**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";

interface SSEEvent {
  type: string;
  data: any;
}

export function useSSE(eventId: string) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/events/${eventId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "connected") {
          setConnected(true);
        } else {
          setEvents((prev) => [...prev, data]);
        }
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [eventId]);

  return { events, connected };
}
```

- [ ] **Step 3: Create components/guest/PhotoCard.tsx**

```tsx
interface PhotoCardProps {
  photo: {
    id: string;
    fileUrl: string;
    guestName?: string | null;
    message?: string | null;
    uploadedAt: string;
  };
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <img
        src={photo.fileUrl}
        alt={`Foto oleh ${photo.guestName || "Anonymous"}`}
        className="w-full aspect-square object-cover"
        loading="lazy"
      />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-800 text-sm">
            {photo.guestName || "Anonymous"}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(photo.uploadedAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {photo.message && (
          <p className="text-sm text-gray-600 mt-2">{photo.message}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create components/guest/LiveFeed.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSSE } from "@/hooks/useSSE";
import PhotoCard from "./PhotoCard";

interface LiveFeedProps {
  eventId: string;
  initialPhotos: any[];
}

export default function LiveFeed({ eventId, initialPhotos }: LiveFeedProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const { events, connected } = useSSE(eventId);

  // Process SSE events
  useEffect(() => {
    events.forEach((event) => {
      if (event.type === "photo:new") {
        setPhotos((prev) => [event.data, ...prev]);
      } else if (event.type === "photo:deleted") {
        setPhotos((prev) => prev.filter((p) => p.id !== event.data.photoId));
      } else if (event.type === "photo:hidden") {
        setPhotos((prev) => prev.filter((p) => p.id !== event.data.photoId));
      }
    });
  }, [events]);

  return (
    <div className="min-h-screen bg-cream-100 py-6 px-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-h3 text-gray-900">Live Feed</h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-gray-500">
              {connected ? "Live" : "Connecting..."}
            </span>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-gray-500">Belum ada foto. Jadilah yang pertama!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create app/g/[slug]/feed/page.tsx**

```tsx
import { db } from "@/lib/db";
import LiveFeed from "@/components/guest/LiveFeed";

export default async function FeedPage({ params }: { params: { slug: string } }) {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
    select: { id: true, title: true },
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-gray-600">Event tidak ditemukan</p>
      </div>
    );
  }

  const photos = await db.photo.findMany({
    where: {
      eventId: event.id,
      status: "approved",
    },
    orderBy: { uploadedAt: "desc" },
    take: 100,
  });

  return <LiveFeed eventId={event.id} initialPhotos={photos} />;
}
```

- [ ] **Step 6: Commit**

```bash
git add app/api/events/[eventId]/stream/ hooks/useSSE.ts components/guest/ app/g/[slug]/feed/
git commit -m "feat: add SSE real-time live feed for guest app"
```

---

## Summary

### Phase 0 Complete (Foundation)

- [x] Next.js project initialized
- [x] Tailwind with Manunggal design tokens
- [x] Prisma schema with all tables
- [x] PostgreSQL connection
- [x] Redis connection
- [x] Cloudinary integration
- [x] JWT authentication system
- [x] Base UI components
- [x] Marketing pages

### Phase 1 Complete (Guest Core)

- [x] Guest landing page
- [x] Name input (optional, localStorage)
- [x] Camera capture component
- [x] Gallery upload with multi-select
- [x] Direct upload to Cloudinary (signed URLs)
- [x] Photo metadata save to database
- [x] SSE real-time stream
- [x] Live feed with auto-refresh
- [x] Digital guestbook (photos + messages)

### Phase 2-6 (Future)

See spec document for Phase 2 (Host Dashboard), Phase 3 (Live Slideshow), Phase 4 (QR Signage), Phase 5 (Vendor B2B), Phase 6 (Monetization & Launch).
