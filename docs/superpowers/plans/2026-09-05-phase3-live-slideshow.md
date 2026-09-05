# Phase 3: Live Slideshow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fullscreen auto-rotating live slideshow page at `/live/{slug}` that shows approved photos in real time, with transitions and interval configurable by the event host and controllable both locally (on-screen overlay) and remotely (from the host dashboard).

**Architecture:** A new public route group `app/live/[slug]` renders a client slideshow engine. The engine holds photo state in refs to avoid jumps when new approved photos stream in over SSE. Host control commands travel over a new Redis channel `event:{eventId}:slideshow` published from authenticated dashboard routes and consumed by a new control-stream SSE endpoint the slideshow page subscribes to. Slideshow config (interval, transition) lives in the existing `event.settings` JSON column. Photo moderation and upload events reuse the existing `event:{eventId}:photos` channel.

**Tech Stack:** Next.js 16.3.4 App Router (async `params`), React 19 client components, Tailwind v4 CSS transitions, TanStack Query, Redis (ioredis) pub/sub, SSE, zod, pino. No new runtime dependencies.

## Global Constraints

- TypeScript strict, no `any`: define and export explicit types (photo queue, config, commands) in `lib/types.ts` and reuse them everywhere.
- Prisma JSON columns are `JsonValue`: never pass app objects straight into `settings`; use `lib/mappers.ts` style guards.
- All route handlers and server pages use async `params: Promise<{...}>` + `await params`.
- API response envelope: `{ success, data?, error?: { code, message } }` via `successResponse`/`errorResponse` in `lib/errors.ts`.
- Logging via pino child logger, object-first signature: `logger.info({ eventId }, "message")`.
- No em dashes in any UI copy; Indonesian UI text.
- Tailwind classes only, no inline styles for layout.
- SSE events carry `{ type, data }`; Redis channel messages are JSON of that same shape.
- Tests: vitest with `globals: true`; component tests import `vi` where mocking is needed; tests live under `tests/`.

---

### Task 1: Slideshow types, validation, and Redis publish helper

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/validations.ts`
- Modify: `lib/redis.ts`
- Create: `lib/slideshow.ts`
- Test: `tests/unit/redis.test.ts`
- Test: `tests/unit/validations.test.ts`
- Test: `tests/unit/types.test.ts`
- Test: `tests/unit/slideshow.test.ts`

**Interfaces:**
- Consumes: existing `EventSettings`, `Photo`, `redis` singleton, `z` from zod, `DEFAULT_SLIDESHOW_CONFIG`.
- Produces:
  - `export type SlideshowTransition = "fade" | "slide" | "zoom";`
  - `export type SlideshowCommandType = "pause" | "resume" | "skip" | "stop" | "config";`
  - `export interface SlideshowConfig { intervalSec: number; transition: SlideshowTransition; showMessages: boolean; }`
  - `export interface SlideshowCommand { type: SlideshowCommandType; issuedBy?: string; config?: SlideshowConfig; }`
  - `export const DEFAULT_SLIDESHOW_CONFIG: SlideshowConfig` (value `{ intervalSec: 5, transition: "fade", showMessages: true }`)
  - `export function slideshowChannel(eventId: string): string` returns `event:${eventId}:slideshow`
  - `export async function publishSlideshowCommand(eventId: string, command: SlideshowCommand): Promise<void>` publishes `JSON.stringify({ type: "slideshow:command", data: command })` to `slideshowChannel(eventId)`.
  - `export const slideshowConfigSchema = z.object({ intervalSec: ..., transition: ..., showMessages: ... })` and `export const slideshowCommandSchema = z.object({ type: z.enum([...]), config: slideshowConfigSchema.optional() })`.
  - Extend `EventSettings` in `lib/types.ts` with `slideshow?: SlideshowConfig`.
  - `export function readSlideshowConfig(settings: unknown): SlideshowConfig` in `lib/slideshow.ts` reads `settings.slideshow` (nested object) falling back to `DEFAULT_SLIDESHOW_CONFIG` field by field.

- [ ] **Step 1: Write the failing type, validation, and helper tests**

Append to `tests/unit/types.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Slideshow types", () => {
  it("should have a default slideshow config", async () => {
    const { DEFAULT_SLIDESHOW_CONFIG } = await import("@/lib/types");
    expect(DEFAULT_SLIDESHOW_CONFIG).toEqual({
      intervalSec: 5,
      transition: "fade",
      showMessages: true,
    });
  });
});
```

Add a new `describe("Slideshow types", ...)` block at the end of `tests/unit/types.test.ts` (which currently ends with the `PhotoMetadata` describe block; keep its existing imports untouched and import `DEFAULT_SLIDESHOW_CONFIG` inside the test via dynamic `import()`). Then append to `tests/unit/validations.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Slideshow validation", () => {
  it("should accept a valid config", async () => {
    const { slideshowConfigSchema } = await import("@/lib/validations");
    const parsed = slideshowConfigSchema.parse({
      intervalSec: 7,
      transition: "zoom",
      showMessages: false,
    });
    expect(parsed.intervalSec).toBe(7);
  });

  it("should reject interval below 3", async () => {
    const { slideshowConfigSchema } = await import("@/lib/validations");
    expect(() =>
      slideshowConfigSchema.parse({ intervalSec: 2, transition: "fade" })
    ).toThrow();
  });

  it("should reject interval above 10", async () => {
    const { slideshowConfigSchema } = await import("@/lib/validations");
    expect(() =>
      slideshowConfigSchema.parse({ intervalSec: 11, transition: "fade" })
    ).toThrow();
  });
});
```

Create `tests/unit/slideshow.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("readSlideshowConfig", () => {
  it("returns defaults when settings has no slideshow block", async () => {
    const { readSlideshowConfig } = await import("@/lib/slideshow");
    const config = readSlideshowConfig({});
    expect(config).toEqual({ intervalSec: 5, transition: "fade", showMessages: true });
  });

  it("reads nested slideshow config and fills gaps from defaults", async () => {
    const { readSlideshowConfig } = await import("@/lib/slideshow");
    const config = readSlideshowConfig({
      slideshow: { intervalSec: 7, transition: "zoom" },
    });
    expect(config.intervalSec).toBe(7);
    expect(config.transition).toBe("zoom");
    expect(config.showMessages).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/unit/types.test.ts tests/unit/validations.test.ts tests/unit/slideshow.test.ts`
Expected: FAIL, names `DEFAULT_SLIDESHOW_CONFIG`, `slideshowConfigSchema`, `readSlideshowConfig` not found.

- [ ] **Step 3: Implement types, validation, Redis helper**

In `lib/types.ts`, extend `EventSettings` and add near the bottom (before `Order` is fine, but grouped with settings):

```typescript
export type SlideshowTransition = "fade" | "slide" | "zoom";

export type SlideshowCommandType = "pause" | "resume" | "skip" | "stop" | "config";

export interface SlideshowConfig {
  intervalSec: number;
  transition: SlideshowTransition;
  showMessages: boolean;
}

export interface SlideshowCommand {
  type: SlideshowCommandType;
  issuedBy?: string;
  config?: SlideshowConfig;
}

export const DEFAULT_SLIDESHOW_CONFIG: SlideshowConfig = {
  intervalSec: 5,
  transition: "fade",
  showMessages: true,
};
```

Then change the `EventSettings` interface (keep existing fields):

```typescript
export interface EventSettings {
  moderationEnabled?: boolean;
  maxPhotosPerGuest?: number | null;
  slideshowInterval?: number;
  slideshowTransition?: SlideshowTransition;
  autoApprove?: boolean;
  slideshow?: SlideshowConfig;
}
```

Keep `slideshowInterval`/`slideshowTransition` as-is so any existing dashboard settings UI that reads them does not break; the new canonical nested shape is `slideshow`.

In `lib/validations.ts` append:

```typescript
export const slideshowConfigSchema = z.object({
  intervalSec: z.number().int().min(3).max(10),
  transition: z.enum(["fade", "slide", "zoom"]),
  showMessages: z.boolean(),
});

export const slideshowCommandSchema = z.object({
  type: z.enum(["pause", "resume", "skip", "stop", "config"]),
  issuedBy: z.string().optional(),
  config: slideshowConfigSchema.optional(),
});
```

In `lib/redis.ts` append:

```typescript
import type { SlideshowCommand } from "./types";

export function slideshowChannel(eventId: string): string {
  return `event:${eventId}:slideshow`;
}

export async function publishSlideshowCommand(
  eventId: string,
  command: SlideshowCommand
): Promise<void> {
  await redis.publish(
    slideshowChannel(eventId),
    JSON.stringify({
      type: "slideshow:command",
      data: command,
    })
  );
}
```

Note: add the `import type` at the top of `lib/redis.ts`, not in the middle.

In `lib/slideshow.ts` create the config resolver (single source of truth, used by both the live page and its bootstrap API):

```typescript
import {
  DEFAULT_SLIDESHOW_CONFIG,
  type SlideshowConfig,
  type EventSettings,
} from "./types";

export function readSlideshowConfig(settings: unknown): SlideshowConfig {
  const s = (settings ?? {}) as Partial<EventSettings>;
  const nested = s.slideshow;
  return {
    intervalSec: nested?.intervalSec ?? DEFAULT_SLIDESHOW_CONFIG.intervalSec,
    transition: nested?.transition ?? DEFAULT_SLIDESHOW_CONFIG.transition,
    showMessages: nested?.showMessages ?? DEFAULT_SLIDESHOW_CONFIG.showMessages,
  };
}
```

- [ ] **Step 4: Run the new unit tests**

Run: `npm run test:run -- tests/unit/types.test.ts tests/unit/validations.test.ts tests/unit/redis.test.ts tests/unit/slideshow.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/types.ts lib/validations.ts lib/redis.ts lib/slideshow.ts tests/unit/types.test.ts tests/unit/validations.test.ts tests/unit/redis.test.ts tests/unit/slideshow.test.ts
git commit -m "feat: add slideshow types, validation, config resolver, and redis publish helper"
```

---

### Task 2: Slideshow config read API for the live page

**Files:**
- Create: `app/api/live/[slug]/route.ts`
- Test: `tests/unit/validations.test.ts` (already covers schema; no new test needed here, route is thin)

**Interfaces:**
- Consumes: `db`, `nextResponse`, `successResponse`, `handleApiError`, `Errors`, `toPhoto` mapper, `readSlideshowConfig`.
- Produces: `GET /api/live/[slug]` returns `{ success: true, data: { eventId, slug, title, photos: Photo[], slideshowConfig: SlideshowConfig } }`.

- [ ] **Step 1: Create the route**

Create `app/api/live/[slug]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { toPhoto } from "@/lib/mappers";
import { readSlideshowConfig } from "@/lib/slideshow";
import type { SlideshowConfig } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, status: true, settings: true },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
    }
    if (event.status === "draft") {
      return Errors.EVENT_NOT_ACTIVE() as any;
    }

    const rows = await db.photo.findMany({
      where: { eventId: event.id, status: "approved" },
      orderBy: { uploadedAt: "desc" },
      take: 500,
    });

    return successResponse({
      eventId: event.id,
      slug: event.slug,
      title: event.title,
      photos: rows.map(toPhoto),
      slideshowConfig: readSlideshowConfig(event.settings),
    });
  } catch (error) {
    return handleApiError(error, { route: "live/[slug]" });
  }
}
```

- [ ] **Step 2: Build to type check**

Run: `npm run build`
Expected: Build passes. (Route is thin; no dedicated test. Validation lives in Task 1.)

- [ ] **Step 3: Commit**

```bash
git add --literal-pathspecs 'app/api/live/[slug]/route.ts'
git commit -m "feat: add live slideshow bootstrap API with approved photos and config"
```

---

### Task 3: Slideshow control APIs (publish command, config update)

**Files:**
- Create: `app/api/events/[eventId]/slideshow/control/route.ts` (POST/PATCH)
- Modify: `lib/redis.ts` (already has publish helper; no change)
- Test: none standalone (logic is thin over existing schema; validated by Task 1 tests and build)

**Interfaces:**
- Consumes: `requireAuth`, `db`, `slideshowCommandSchema`, `slideshowConfigSchema`, `publishSlideshowCommand`, `DEFAULT_SLIDESHOW_CONFIG`, `successResponse`, `handleApiError`, `Errors`.
- Produces: `POST /api/events/[eventId]/slideshow/control` body `{ type: "pause" | "resume" | "skip" | "stop" | "config", config?: SlideshowConfig }`; when type `config`, persists config into `event.settings.slideshow` then publishes the command. Returns `{ success: true, data: { published: true } }`.

- [ ] **Step 1: Create the control route**

Create `app/api/events/[eventId]/slideshow/control/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { slideshowCommandSchema, slideshowConfigSchema } from "@/lib/validations";
import { publishSlideshowCommand } from "@/lib/redis";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { eventLogger } from "@/lib/logger";
import { DEFAULT_SLIDESHOW_CONFIG, type SlideshowCommand } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const session = await requireAuth();

    const event = await db.event.findUnique({
      where: { id: eventId, hostId: session.userId },
      select: { id: true, settings: true },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
    }

    const body = await req.json();
    const command = slideshowCommandSchema.parse(body) as SlideshowCommand;

    if (command.type === "config") {
      const config = slideshowConfigSchema.parse(body.config ?? {});
      const raw = (event.settings ?? {}) as Record<string, unknown>;
      const next = {
        ...raw,
        slideshow: {
          ...DEFAULT_SLIDESHOW_CONFIG,
          ...config,
        },
      };
      await db.event.update({
        where: { id: eventId },
        data: { settings: next },
      });
    }

    await publishSlideshowCommand(eventId, {
      ...command,
      issuedBy: session.userId,
    });

    eventLogger.info({ eventId, type: command.type }, "Slideshow command published");

    return successResponse({ published: true });
  } catch (error) {
    return handleApiError(error, { route: "events/slideshow/control", eventId });
  }
}
```

- [ ] **Step 2: Build to type check**

Run: `npm run build`
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add --literal-pathspecs 'app/api/events/[eventId]/slideshow/control/route.ts'
git commit -m "feat: add slideshow control API to publish pause, resume, skip, stop, config"
```

---

### Task 4: Slideshow control-stream SSE route (host publishes, live page consumes)

**Files:**
- Create: `app/api/live/[slug]/control-stream/route.ts`

**Interfaces:**
- Consumes: `db`, `redis`, `slideshowChannel`.
- Produces: `GET /api/live/[slug]/control-stream` returns an SSE stream that forwards any message on `event:{eventId}:slideshow` verbatim (`data: <raw message>\n\n`) plus a `connected` hello and 30s heartbeat. It must resolve the event by slug first (async params), then subscribe by resolved event id.

- [ ] **Step 1: Create the route**

Create `app/api/live/[slug]/control-stream/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { redis, slideshowChannel } from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = await db.event.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const channel = slideshowChannel(event.id);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      const subscriber = redis.duplicate();
      subscriber.subscribe(channel);

      subscriber.on("message", (_ch, message) => {
        try {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        } catch {
          // Controller may be closed
        }
      });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

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

- [ ] **Step 2: Build to type check**

Run: `npm run build`
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add --literal-pathspecs 'app/api/live/[slug]/control-stream/route.ts'
git commit -m "feat: add slideshow control-stream SSE endpoint"
```

---

### Task 5: Slideshow engine hook (pure photo queue + command reducer)

**Files:**
- Create: `hooks/useSlideshow.ts`
- Test: `tests/unit/useSlideshow.test.ts`

**Interfaces:**
- Consumes: `Photo`, `SlideshowConfig`, `SlideshowCommand` types; React `useRef`, `useState`, `useEffect`, `useCallback`.
- Produces:
  - `export interface SlideshowEngineState { photos: Photo[]; currentIndex: number; isPlaying: boolean; isStopped: boolean; direction: 1 | -1; transition: SlideshowTransition; showMessages: boolean; }`
  - `export interface SlideshowEngine extends SlideshowEngineState { goToNext(): void; goToPrev(): void; togglePlay(): void; stop(): void; applyPhotoEvent(type: string, data: unknown): void; applyCommand(command: SlideshowCommand): void; }`
  - `export function useSlideshow(initialPhotos: Photo[], config: SlideshowConfig): SlideshowEngine`

**Behavior contract (encode in tests):**
- `applyPhotoEvent("photo:new", { id, ...photo })`: prepends the photo and, if currently showing "nothing"/empty, points currentIndex to it; otherwise leaves currentIndex pointing at the same photo id (index shifts are handled by id-based reconciliation in the hook, not naive index math). If the new photo id is already present, it is ignored (dedup).
- `applyPhotoEvent("photo:deleted" | "photo:hidden", { photoId })`: removes that photo id; if the removed photo was at/currentIndex, advance to keep a valid index (clamp), stop if queue becomes empty.
- `applyCommand({ type: "pause" })`: sets `isPlaying: false`.
- `applyCommand({ type: "resume" })`: sets `isPlaying: true`, `isStopped: false`.
- `applyCommand({ type: "skip" })`: advances one step regardless of play state.
- `applyCommand({ type: "stop" })`: sets `isStopped: true`, `isPlaying: false`.
- `applyCommand({ type: "config", config })`: updates config; persists only internally (persistence handled by API).
- `togglePlay()`: if stopped, sets stopped false and playing true; else toggles playing.
- `stop()`: alias for `applyCommand({ type: "stop" })`.
- The hook auto-advances every `config.intervalSec * 1000` ms while `isPlaying && !isStopped && photos.length > 1`. Auto-advance is driven by a `useEffect` timer keyed on `[isPlaying, isStopped, currentIndex, photos.length, config.intervalSec]`.

Implementation hint: store `photos` in a `useRef<Photo[]>` plus a `photos` state that mirrors it for re-render, and reconcile `currentIndex` by photo id after each mutation. A helper `indexOfCurrent` maps `currentPhotoId` to a fresh index each render. Prefer storing `currentPhotoId` over `currentIndex` internally, exposing `currentIndex` derived.

- [ ] **Step 1: Write the failing unit tests**

Create `tests/unit/useSlideshow.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSlideshow } from "@/hooks/useSlideshow";
import type { Photo } from "@/lib/types";

function makePhoto(id: string): Photo {
  return {
    id,
    eventId: "evt",
    fileKey: id,
    fileUrl: `https://x/${id}.jpg`,
    fileProvider: "cloudinary",
    thumbnailUrl: `https://x/${id}_t.jpg`,
    guestName: null,
    status: "approved",
    metadata: {},
    uploadedAt: new Date("2025-01-01T00:00:00Z"),
  };
}

const config = { intervalSec: 5, transition: "fade" as const, showMessages: true };
const photos = [makePhoto("a"), makePhoto("b"), makePhoto("c")];

describe("useSlideshow", () => {
  it("starts on first photo, playing", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.photos.length).toBe(3);
  });

  it("advances on skip", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() => result.current.applyCommand({ type: "skip" }));
    expect(result.current.currentIndex).toBe(1);
  });

  it("prepends new photo without changing the displayed photo id", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    const current = result.current.photos[result.current.currentIndex].id;
    act(() => result.current.applyPhotoEvent("photo:new", makePhoto("d")));
    expect(result.current.photos[0].id).toBe("d");
    // still showing the same photo as before (index shifted, id same)
    const shown = result.current.photos[result.current.currentIndex];
    expect(shown.id).toBe(current);
    expect(result.current.photos).toHaveLength(4);
  });

  it("dedupes a photo id already present", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() => result.current.applyPhotoEvent("photo:new", makePhoto("a")));
    expect(result.current.photos).toHaveLength(3);
  });

  it("removes hidden photo and stays in range", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() =>
      result.current.applyPhotoEvent("photo:hidden", { photoId: "b" })
    );
    expect(result.current.photos.map((p) => p.id)).not.toContain("b");
    expect(result.current.currentIndex).toBeLessThan(result.current.photos.length);
  });

  it("pauses and resumes", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() => result.current.applyCommand({ type: "pause" }));
    expect(result.current.isPlaying).toBe(false);
    act(() => result.current.applyCommand({ type: "resume" }));
    expect(result.current.isPlaying).toBe(true);
  });

  it("stop stops playback", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() => result.current.applyCommand({ type: "stop" }));
    expect(result.current.isStopped).toBe(true);
    expect(result.current.isPlaying).toBe(false);
  });
});
```

Note: `@testing-library/react` v16.3.3 exports `renderHook`, and `tests/setup.ts` registers `afterEach(cleanup)`, so `renderHook` works with the existing jsdom setup.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/unit/useSlideshow.test.ts`
Expected: FAIL, module `@/hooks/useSlideshow` cannot be resolved.

- [ ] **Step 3: Implement `hooks/useSlideshow.ts`**

Create `hooks/useSlideshow.ts`:

```typescript
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Photo, SlideshowConfig, SlideshowCommand } from "@/lib/types";

export interface SlideshowEngineState {
  photos: Photo[];
  currentIndex: number;
  isPlaying: boolean;
  isStopped: boolean;
  direction: 1 | -1;
}

export interface SlideshowEngine extends SlideshowEngineState {
  goToNext: () => void;
  goToPrev: () => void;
  togglePlay: () => void;
  stop: () => void;
  applyPhotoEvent: (type: string, data: unknown) => void;
  applyCommand: (command: SlideshowCommand) => void;
}

export function useSlideshow(
  initialPhotos: Photo[],
  config: SlideshowConfig
): SlideshowEngine {
  const photosRef = useRef<Photo[]>(initialPhotos);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [currentPhotoId, setCurrentPhotoId] = useState<string | null>(
    initialPhotos[0]?.id ?? null
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isStopped, setIsStopped] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [intervalSec, setIntervalSec] = useState(config.intervalSec);
  const [transition, setTransition] = useState(config.transition);
  const [showMessages, setShowMessages] = useState(config.showMessages);

  const indexOf = useCallback(
    (id: string | null) => (id ? photosRef.current.findIndex((p) => p.id === id) : -1),
    []
  );

  const reconcileTo = useCallback((id: string | null, fallback: number) => {
    const idx = indexOf(id);
    if (idx >= 0) return idx;
    if (photosRef.current.length === 0) return -1;
    const clamped = Math.min(fallback, photosRef.current.length - 1);
    return Math.max(0, clamped);
  }, [indexOf]);

  const commit = useCallback((next: Photo[]) => {
    photosRef.current = next;
    setPhotos(next);
    setCurrentPhotoId((prev) => {
      const existing = next.find((p) => p.id === prev);
      if (existing) return prev;
      // current removed; point at what is now at the same slot, clamp to tail
      return next[0]?.id ?? null;
    });
  }, []);

  const applyPhotoEvent = useCallback((type: string, data: unknown) => {
    if (type === "photo:new") {
      const photo = data as Photo;
      if (!photo?.id) return;
      const exists = photosRef.current.some((p) => p.id === photo.id);
      if (exists) return;
      const next = [photo, ...photosRef.current];
      photosRef.current = next;
      setPhotos(next);
      // If nothing was showing, start on the new photo.
      setCurrentPhotoId((prev) => prev ?? photo.id);
      return;
    }
    if (type === "photo:deleted" || type === "photo:hidden") {
      const photoId = (data as { photoId?: string }).photoId;
      if (!photoId) return;
      const next = photosRef.current.filter((p) => p.id !== photoId);
      commit(next);
    }
  }, [commit]);

  const goToNext = useCallback(() => {
    if (photosRef.current.length === 0) return;
    setDirection(1);
    setCurrentPhotoId((prev) => {
      const idx = reconcileTo(prev, 0);
      return photosRef.current[(idx + 1) % photosRef.current.length]?.id ?? null;
    });
  }, [reconcileTo]);

  const goToPrev = useCallback(() => {
    if (photosRef.current.length === 0) return;
    setDirection(-1);
    setCurrentPhotoId((prev) => {
      const idx = reconcileTo(prev, 0);
      return photosRef.current[(idx - 1 + photosRef.current.length) % photosRef.current.length]?.id ?? null;
    });
  }, [reconcileTo]);

  const applyCommand = useCallback((command: SlideshowCommand) => {
    switch (command.type) {
      case "pause":
        setIsPlaying(false);
        break;
      case "resume":
        setIsStopped(false);
        setIsPlaying(true);
        break;
      case "skip":
        setDirection(1);
        setCurrentPhotoId((prev) => {
          const idx = reconcileTo(prev, 0);
          if (photosRef.current.length === 0) return null;
          return photosRef.current[(idx + 1) % photosRef.current.length]?.id ?? null;
        });
        break;
      case "stop":
        setIsStopped(true);
        setIsPlaying(false);
        break;
      case "config":
        if (command.config) {
          setIntervalSec(command.config.intervalSec);
          setTransition(command.config.transition);
          setShowMessages(command.config.showMessages);
        }
        break;
    }
  }, [reconcileTo]);

  const togglePlay = useCallback(() => {
    if (isStopped) {
      setIsStopped(false);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  }, [isStopped]);

  const stop = useCallback(() => {
    setIsStopped(true);
    setIsPlaying(false);
  }, []);

  // Auto-advance while playing
  useEffect(() => {
    if (!isPlaying || isStopped || photosRef.current.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentPhotoId((prev) => {
        const idx = reconcileTo(prev, 0);
        if (photosRef.current.length === 0) return null;
        return photosRef.current[(idx + 1) % photosRef.current.length]?.id ?? null;
      });
    }, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [isPlaying, isStopped, intervalSec, reconcileTo, photos.length]);

  const currentIndex = useMemo(() => reconcileTo(currentPhotoId, 0), [currentPhotoId, reconcileTo]);

  return {
    photos,
    currentIndex,
    isPlaying,
    isStopped,
    direction,
    transition,
    showMessages,
    goToNext,
    goToPrev,
    togglePlay,
    stop,
    applyPhotoEvent,
    applyCommand,
  };
}
```

Note on the contract tests above: the test `starts on first photo` expects `currentIndex` 0. The derived `currentIndex` via `reconcileTo(currentPhotoId, 0)` gives 0 for the first photo. The `prepends` test prepends `d`, so `photos[0].id` is `d`; `currentPhotoId` stays `a` which is now at index 1, so `currentIndex` is 1, satisfying "same photo id as before". The `skip` test expects `currentIndex` 1 after skip from `a`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/unit/useSlideshow.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add hooks/useSlideshow.ts tests/unit/useSlideshow.test.ts
git commit -m "feat: add slideshow engine hook with photo queue and command handling"
```

---

### Task 6: Slideshow client component (rendering, transitions, auto-advance, controls)

**Files:**
- Create: `components/live/SlideshowPhotoView.tsx`
- Create: `components/live/SlideshowControls.tsx`
- Test: `tests/components/SlideshowPhotoView.test.tsx`

**Interfaces:**
- Consumes: `useSlideshow` engine (Task 5), `Photo`, `SlideshowTransition`, `SlideshowCommand`, Tailwind. The engine is wired to SSE in `SlideshowStage` (Task 7), not in these presentational components.
- Produces: a pure helper `transitionClass(transition: SlideshowTransition): string` (exported from `SlideshowPhotoView.tsx`) that maps the config value to a Tailwind animation utility class provided by `tw-animate-css` (already imported in `app/globals.css`), and the presentational `SlideshowPhotoView` which renders the current photo fullscreen applying that class on each photo change (via a `key`), showing the guest message overlay when `showMessages` is true. `SlideshowControls` renders prev/play-pause/next/stop buttons that call engine methods passed as props.

**Transition mapping (must match — see `transitionClass`, used by both the component and its test):**
| `SlideshowTransition` | Tailwind class (tw-animate-css) |
|---|---|
| `fade`    | `animate-in fade-in duration-700` |
| `slide`   | `animate-in slide-in-from-right-40 duration-500` |
| `zoom`    | `animate-in zoom-in-75 duration-500` |

**Notes**
- The guest photos SSE channel (`/api/g/{slug}/stream`) emits `photo:new` only when `autoApprove` is enabled (see `app/api/g/[slug]/photos/route.ts`). The slideshow may show photos that were approved later (after moderation), so the live page must ALSO poll for changes or reconnect on focus. Simplest robust approach: on each SSE `photo:new`/`photo:hidden`/`photo:deleted`, also trigger a re-fetch of `/api/live/{slug}` and reconcile. The engine `applyPhotoEvent` handles dedup and removal, so refetching the list wholesale and diffing via `applyPhotoEvent("photo:new")`/`("photo:deleted")` against the previous known set is acceptable. Keep this simple and correct: maintain a `knownIds` set in the component; on each poll/SSE, compute added and removed ids vs `knownIds`, then call engine methods accordingly, then update `knownIds`. This avoids fighting the queue semantics.

- [ ] **Step 1: Write the failing tests (presentational view + transition helper)**

Create `tests/components/SlideshowPhotoView.test.tsx`. Test the presentational `SlideshowPhotoView` (photo + message overlay) and the pure `transitionClass` helper. The engine and SSE wiring are covered by hook tests (Task 5); do not mock SSE here.

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SlideshowPhotoView, { transitionClass } from "@/components/live/SlideshowPhotoView";
import type { Photo } from "@/lib/types";

const photo: Photo = {
  id: "p1",
  eventId: "evt",
  fileKey: "p1",
  fileUrl: "https://x/p1.jpg",
  fileProvider: "cloudinary",
  thumbnailUrl: "https://x/p1_t.jpg",
  guestName: "Sari",
  message: "Selamat dan sukses!",
  status: "approved",
  metadata: {},
  uploadedAt: new Date("2025-01-01T00:00:00Z"),
};

describe("transitionClass", () => {
  it("maps fade to a fade-in animation utility", () => {
    expect(transitionClass("fade")).toContain("fade-in");
  });

  it("maps slide to a slide-in-from-right utility", () => {
    expect(transitionClass("slide")).toContain("slide-in-from-right-40");
  });

  it("maps zoom to a zoom-in utility", () => {
    expect(transitionClass("zoom")).toContain("zoom-in-75");
  });
});

describe("SlideshowPhotoView", () => {
  it("renders the photo image fullscreen", () => {
    render(<SlideshowPhotoView photo={photo} showMessages={true} transition="fade" />);
    const img = screen.getByAltText("Foto slideshow");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", photo.fileUrl);
  });

  it("shows the guest message when showMessages is true", () => {
    render(<SlideshowPhotoView photo={photo} showMessages={true} transition="fade" />);
    expect(screen.getByText("Selamat dan sukses!")).toBeInTheDocument();
    expect(screen.getByText("Sari")).toBeInTheDocument();
  });

  it("hides the message overlay when showMessages is false", () => {
    render(<SlideshowPhotoView photo={photo} showMessages={false} transition="fade" />);
    expect(screen.queryByText("Selamat dan sukses!")).not.toBeInTheDocument();
  });
});
```

`transitionClass` is a pure helper that must be testable without jsdom animation support because it only asserts the returned string contains expected utility names.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/components/SlideshowPhotoView.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement the presentational components**

Create `components/live/SlideshowPhotoView.tsx`:

```tsx
import type { Photo, SlideshowTransition } from "@/lib/types";

export function transitionClass(transition: SlideshowTransition): string {
  switch (transition) {
    case "slide":
      return "animate-in slide-in-from-right-40 duration-500";
    case "zoom":
      return "animate-in zoom-in-75 duration-500";
    case "fade":
    default:
      return "animate-in fade-in duration-700";
  }
}

interface SlideshowPhotoViewProps {
  photo: Photo;
  showMessages: boolean;
  transition: SlideshowTransition;
}

export default function SlideshowPhotoView({
  photo,
  showMessages,
  transition,
}: SlideshowPhotoViewProps) {
  return (
    <div className="relative h-full w-full bg-black">
      <img
        key={photo.id}
        src={photo.fileUrl}
        alt="Foto slideshow"
        className={`h-full w-full object-contain ${transitionClass(transition)}`}
      />
      {showMessages && (photo.message || photo.guestName) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-8 pt-16 text-white">
          {photo.guestName && (
            <p className="text-lg font-semibold">{photo.guestName}</p>
          )}
          {photo.message && (
            <p className="mt-1 text-2xl">{photo.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

The `key={photo.id}` on the `<img>` forces React to remount the element when the shown photo changes, re-triggering the CSS animation so each new frame animates in with the configured transition.

Create `components/live/SlideshowControls.tsx`:

```tsx
interface SlideshowControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStop: () => void;
}

export default function SlideshowControls({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  onStop,
}: SlideshowControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Foto sebelumnya"
        className="rounded-full bg-white/20 p-3 text-white backdrop-blur transition hover:bg-white/40"
      >
        ←
      </button>
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Jeda" : "Putar"}
        className="rounded-full bg-white/20 p-3 text-white backdrop-blur transition hover:bg-white/40"
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Foto berikutnya"
        className="rounded-full bg-white/20 p-3 text-white backdrop-blur transition hover:bg-white/40"
      >
        →
      </button>
      <button
        type="button"
        onClick={onStop}
        aria-label="Berhenti"
        className="rounded-full bg-red-500/30 p-3 text-white backdrop-blur transition hover:bg-red-500/50"
      >
        ⏹
      </button>
    </div>
  );
}
```

Note: plain buttons with emoji/symbols keep this dependency-free and match the existing guest UI's emoji-heavy button style (see `components/dashboard/PhotoCard.tsx`). If lucide icons are preferred and already imported in the codebase, they may be swapped, but do not add a new dependency.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/components/SlideshowPhotoView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/live/ tests/components/SlideshowPhotoView.test.tsx
git commit -m "feat: add slideshow photo view and control components"
```

---

### Task 7: Live slideshow page `/live/[slug]` wiring SSE, control stream, engine

**Files:**
- Create: `app/live/[slug]/page.tsx` (server component: loads event + config + initial photos)
- Create: `components/live/SlideshowStage.tsx` (client: fetches `/api/live/{slug}`, wires SSE photos + control stream, renders engine)
- Create: `app/live/[slug]/layout.tsx` OR a full-black wrapper (to ensure no dashboard layout leaks). Place `app/live/layout.tsx` minimal fullscreen black.

**Interfaces:**
- Consumes: server page reads DB directly (like `feed/page.tsx`), maps via `toPhoto`, reads config via the same helper as Task 2; passes initial `photos`, `slideshowConfig`, `slug`, `title`, `eventId` to the client `SlideshowStage`.
- Produces: public route `/live/{slug}`.

**Layout isolation:** The root layout (`app/layout.tsx`) wraps everything with `<Providers>` and no nav; there is no host dashboard on `/live` because the route group `(dashboard)` is scoped under `/dashboard` via `app/(dashboard)/layout.tsx`. So no global nav leaks. But the body bg is `bg-background`. Use a `app/live/layout.tsx` to force fullscreen black for the whole group.

- [ ] **Step 1: Create `app/live/layout.tsx`**

```tsx
export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-black">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `app/live/[slug]/page.tsx`**

```tsx
import { db } from "@/lib/db";
import { toPhoto } from "@/lib/mappers";
import { readSlideshowConfig } from "@/lib/slideshow";
import SlideshowStage from "@/components/live/SlideshowStage";

export default async function LiveSlideshowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await db.event.findUnique({
    where: { slug },
    select: { id: true, slug: true, title: true, status: true, settings: true },
  });

  if (!event || event.status === "draft") {
    return (
      <div className="flex h-full items-center justify-center text-white">
        <p>Event tidak ditemukan</p>
      </div>
    );
  }

  const rows = await db.photo.findMany({
    where: { eventId: event.id, status: "approved" },
    orderBy: { uploadedAt: "desc" },
    take: 500,
  });

  return (
    <SlideshowStage
      slug={slug}
      title={event.title}
      eventId={event.id}
      initialPhotos={rows.map(toPhoto)}
      initialConfig={readSlideshowConfig(event.settings)}
    />
  );
}
```

- [ ] **Step 3: Create `components/live/SlideshowStage.tsx`**

This is the client heart. It connects two SSE endpoints:
- Photos: `/api/g/{slug}/stream` (existing, emits `photo:new`, `photo:hidden`, `photo:deleted`).
- Control: `/api/live/{slug}/control-stream` (new, emits `slideshow:command`).

It also performs a refetch of `/api/live/{slug}` whenever any photo event arrives (and on mount + window focus), to catch photos approved after the initial server render even when `autoApprove` is off. It diffs against a `knownIds` ref and applies add/remove to the engine.

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSlideshow } from "@/hooks/useSlideshow";
import SlideshowPhotoView from "./SlideshowPhotoView";
import SlideshowControls from "./SlideshowControls";
import type { Photo, SlideshowConfig } from "@/lib/types";

interface SlideshowStageProps {
  slug: string;
  title: string;
  eventId: string;
  initialPhotos: Photo[];
  initialConfig: SlideshowConfig;
}

interface LivePayload {
  eventId: string;
  slug: string;
  title: string;
  photos: Photo[];
  slideshowConfig: SlideshowConfig;
}

export default function SlideshowStage({
  slug,
  title,
  eventId,
  initialPhotos,
  initialConfig,
}: SlideshowStageProps) {
  const engine = useSlideshow(initialPhotos, initialConfig);
  const [connected, setConnected] = useState(false);
  const knownIds = useRef<Set<string>>(new Set(initialPhotos.map((p) => p.id)));
  const photosRef = useRef<Photo[]>(initialPhotos);

  const refetchAndReconcile = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/${slug}`);
      if (!res.ok) return;
      const data = (await res.json()) as { success: boolean; data?: LivePayload };
      if (!data.success || !data.data) return;
      const fresh = data.data.photos;
      const freshIds = new Set(fresh.map((p) => p.id));

      // Removed
      for (const p of photosRef.current) {
        if (!freshIds.has(p.id)) {
          engine.applyPhotoEvent("photo:deleted", { photoId: p.id });
        }
      }
      // Added
      for (const p of fresh) {
        if (!knownIds.current.has(p.id)) {
          engine.applyPhotoEvent("photo:new", p);
        }
      }
      knownIds.current = freshIds;
      photosRef.current = fresh;
      engine.applyCommand({ type: "config", config: data.data.slideshowConfig });
    } catch {
      // transient fetch error; ignore
    }
  }, [slug, engine]);

  // Photos SSE
  useEffect(() => {
    const es = new EventSource(`/api/g/${slug}/stream`);
    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as { type: string; data?: unknown };
        if (parsed.type === "connected") {
          setConnected(true);
          return;
        }
        if (
          parsed.type === "photo:new" ||
          parsed.type === "photo:hidden" ||
          parsed.type === "photo:deleted"
        ) {
          refetchAndReconcile();
        }
      } catch {
        // ignore malformed frame
      }
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [slug, refetchAndReconcile]);

  // Control SSE
  useEffect(() => {
    const es = new EventSource(`/api/live/${slug}/control-stream`);
    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as {
          type: string;
          data?: { type?: string; config?: SlideshowConfig };
        };
        if (parsed.type === "slideshow:command" && parsed.data?.type) {
          engine.applyCommand({
            type: parsed.data.type,
            config: parsed.data.config,
          } as Parameters<typeof engine.applyCommand>[0]);
        }
      } catch {
        // ignore malformed frame
      }
    };
    return () => es.close();
  }, [slug, engine]);

  // Poll on window focus (venue screen may be re-opened)
  useEffect(() => {
    const onFocus = () => refetchAndReconcile();
    window.addEventListener("focus", onFocus);
    refetchAndReconcile();
    return () => window.removeEventListener("focus", onFocus);
  }, [refetchAndReconcile]);

  const current = engine.photos[engine.currentIndex];

  return (
    <div className="relative h-full w-full">
      {current ? (
        <SlideshowPhotoView
          photo={current}
          showMessages={engine.showMessages}
          transition={engine.transition}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-white">
          <p className="text-2xl">Belum ada foto yang ditampilkan</p>
        </div>
      )}

      {/* Top bar: title + live indicator */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4">
        <span className="text-white drop-shadow">{title}</span>
        <span className="flex items-center gap-2 text-sm text-white/80">
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-green-400" : "bg-red-500"
            }`}
          />
          {connected ? "Live" : "Terhubung..."}
        </span>
      </div>

      {/* Controls shown on demand */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <SlideshowControls
          isPlaying={engine.isPlaying}
          onTogglePlay={engine.togglePlay}
          onPrev={engine.goToPrev}
          onNext={engine.goToNext}
          onStop={engine.stop}
        />
      </div>
    </div>
  );
}
```

Note: the `SlideshowControls` shows always. The spec design says show on mouse move / tap; the on-mouse-move reveal is a nice-to-have. For an MVP the always-on subtle translucent controls are acceptable and testable. Optionally wrap the controls in a div that fades out after 4s of no pointer movement; implement only if straightforward (see polish phase otherwise).

Engine is created once with `initialPhotos`/`initialConfig`. Because `useSlideshow` is a hook that returns fresh closures each render, the effect dependencies `[slug, engine]` would retrigger SSE reconnect every render. Fix: memoize `engine` methods or depend on a stable ref to the engine. Since `useSlideshow` uses `useCallback` for methods, but the returned object is new each render. Depend on the stable bits instead: use `engineRef = useRef(engine)` and update it each render; in effects, read `engineRef.current`. This avoids reconnecting SSE on every photo advance. Update the effect dependency arrays to `[slug]` only and read methods via `engineRef.current`.

- [ ] **Step 4: Fix the effect-stability concern**

Restructure to keep the two `useEffect`s keyed only on `slug`:

```tsx
const engine = useSlideshow(initialPhotos, initialConfig);
const engineRef = useRef(engine);
engineRef.current = engine;
```

Then inside the photos-SSE effect, call `engineRef.current.applyPhotoEvent(...)` and in the refetch callback use `engineRef.current`. The `refetchAndReconcile` useCallback depends on `engineRef` (stable) and `slug`. Do NOT put `engine` in any effect dependency array; read from `engineRef.current` instead. The poll-on-focus effect depends only on `refetchAndReconcile` which is stable if it closes over `engineRef` (a ref) and `slug`.

Reconcile `engineRef` assignment is a render-side side effect; acceptable for a ref mirror pattern used elsewhere in this codebase.

- [ ] **Step 5: Build and run tests**

Run: `npm run build`
Run: `npm run test:run`
Expected: Build passes, all tests (now 78 + new) pass.

- [ ] **Step 6: Commit**

```bash
git add app/live/ components/live/SlideshowStage.tsx
git commit -m "feat: add live slideshow page with SSE and real-time photo sync"
```

---

### Task 8: Host dashboard slideshow panel (remote controls + link)

**Files:**
- Modify: `app/(dashboard)/events/[eventId]/page.tsx`
- Create: `components/dashboard/SlideshowPanel.tsx`
- Test: `tests/components/SlideshowPanel.test.tsx`

**Interfaces:**
- Consumes: `event` (with `slug`, `id`), `slideshowConfigSchema`, POST `/api/events/[eventId]/slideshow/control`, React Query `useMutation`, UI Button.
- Produces: `SlideshowPanel` presentational + hook-free client component that takes `eventId` and `slug`, shows a "Buka Layar" link to `/live/{slug}` (opens new tab), pause/resume/skip/stop buttons, and an inline interval/transition selector that persists via the control API when changed.

- [ ] **Step 1: Write the failing component test**

Create `tests/components/SlideshowPanel.test.tsx`. Because the panel makes fetch calls and uses React Query, mock the fetch and wrap in a QueryClientProvider.

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SlideshowPanel from "@/components/dashboard/SlideshowPanel";

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("SlideshowPanel", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { published: true } }),
    }) as unknown as typeof fetch;
  });

  it("renders link to open slideshow screen", () => {
    renderWithQuery(<SlideshowPanel eventId="e1" slug="my-event" />);
    expect(screen.getByText("Buka Layar Slideshow")).toBeInTheDocument();
  });

  it("sends pause command", async () => {
    renderWithQuery(<SlideshowPanel eventId="e1" slug="my-event" />);
    fireEvent.click(screen.getByRole("button", { name: /jeda/i }));
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/events/e1/slideshow/control",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"type":"pause"'),
      })
    );
  });
});
```

Note: verify no existing test wraps in QueryClientProvider. This is the standard pattern. If fireEvent import pattern differs, match the codebase.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/components/SlideshowPanel.test.tsx`
Expected: FAIL, module `@/components/dashboard/SlideshowPanel` not found.

- [ ] **Step 3: Implement `SlideshowPanel.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { ApiResponse, SlideshowCommand } from "@/lib/types";

interface SlideshowPanelProps {
  eventId: string;
  slug: string;
  intervalSec?: number;
  transition?: "fade" | "slide" | "zoom";
}

export default function SlideshowPanel({
  eventId,
  slug,
  intervalSec = 5,
  transition = "fade",
}: SlideshowPanelProps) {
  const queryClient = useQueryClient();
  const [localInterval, setLocalInterval] = useState(intervalSec);

  const send = useMutation({
    mutationFn: async (command: SlideshowCommand) => {
      const res = await fetch(`/api/events/${eventId}/slideshow/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });
      const data: ApiResponse<{ published: boolean }> = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Slideshow</h3>
        <a
          href={`/live/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline"
        >
          Buka Layar Slideshow
        </a>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => send.mutate({ type: "pause" })}
        >
          ⏸ Jeda
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => send.mutate({ type: "resume" })}
        >
          ▶ Lanjut
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => send.mutate({ type: "skip" })}
        >
          ⏭ Lewati
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => send.mutate({ type: "stop" })}
        >
          ⏹ Berhenti
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <label htmlFor="slideshow-interval" className="text-muted-foreground">
          Interval
        </label>
        <select
          id="slideshow-interval"
          value={localInterval}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocalInterval(v);
            send.mutate({
              type: "config",
              config: { intervalSec: v, transition, showMessages: true },
            });
          }}
          className="rounded border px-2 py-1"
        >
          {[3, 5, 7, 10].map((sec) => (
            <option key={sec} value={sec}>
              {sec} detik
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/components/SlideshowPanel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wire the panel into the event detail page**

In `app/(dashboard)/events/[eventId]/page.tsx`, after the "Guest Access" Card block, add a new Card section:

```tsx
{/* Slideshow Panel */}
{event.slug && (
  <SlideshowPanel
    eventId={event.id}
    slug={event.slug}
    intervalSec={event.settings?.slideshow?.intervalSec ?? 5}
    transition={event.settings?.slideshow?.transition ?? "fade"}
  />
)}
```

Add the import at the top: `import SlideshowPanel from "@/components/dashboard/SlideshowPanel";`. Note that the settings may be nested JSON typed as `EventSettings` in `lib/types.ts`; read defensively with optional chaining. The `event` type here is `EventWithPhotos extends Event` so `event.settings` is available.

- [ ] **Step 6: Build and run tests**

Run: `npm run build`
Run: `npm run test:run`
Expected: Build passes; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add components/dashboard/SlideshowPanel.tsx tests/components/SlideshowPanel.test.tsx
git add --literal-pathspecs 'app/(dashboard)/events/[eventId]/page.tsx'
git commit -m "feat: add host slideshow control panel to event dashboard"
```

---

### Task 9: Docs update (spec + plan checkboxes)

**Files:**
- Modify: `docs/superpowers/specs/2026-09-05-manunggal-design.md` (mark Phase 3 done)
- Modify: `docs/superpowers/plans/2026-09-05-phase3-live-slideshow.md` (this file, mark checkboxes done as tasks complete)

- [ ] **Step 1: Update the spec**

In the spec's Implementation Phases section, under Phase 3 bullet list, change the leading text from "Phase 3: Live Slideshow (Week 5)" notes to a done status note, and mark each sub-bullet with a checkbox `- [x]` as completed. Add a short "What shipped" note referencing the new routes and component.

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-09-05-manunggal-design.md
git commit -m "docs: mark phase 3 slideshow as complete"
```

---

## Summary

Phase 3 ships:
- Slideshow config, command, and queue types (`lib/types.ts`), zod schemas, and a Redis publish helper on a dedicated `slideshow` channel.
- Public bootstrap API `/api/live/[slug]` returning approved photos + resolved config.
- Auth-gated control API `/api/events/[eventId]/slideshow/control` that persists config and publishes commands.
- SSE control stream `/api/live/[slug]/control-stream`.
- Pure engine hook `useSlideshow` (photo queue, id-based reconcile, dedup, pause/resume/skip/stop/config, auto-advance) with unit tests.
- Presentational components `SlideshowPhotoView`, `SlideshowControls`, wired into `SlideshowStage` and the fullscreen public page `app/live/[slug]`, which listens to the existing photos SSE channel and the new control stream and reconciles on poll/focus.
- Host dashboard `SlideshowPanel` with open-screen link and pause/resume/skip/stop plus interval selector, persisted via the control API.
- No new runtime dependencies; no DB migration (config stored in `event.settings.slideshow`).
