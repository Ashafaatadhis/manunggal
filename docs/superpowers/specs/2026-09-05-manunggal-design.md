# Manunggal - Design Specification

## Overview

Manunggal is a web-based SaaS platform for real-time shared photo albums at any event. Guests scan a QR code, upload photos directly from their phone (camera or gallery), and photos appear instantly on a live feed and optional slideshow at the venue. The platform supports weddings, birthdays, graduations, corporate events, and more.

**Tagline:** Album digital real-time untuk semua acaramu.

**Differentiation from Morements (reference):**
- Real-time live feed (photos appear during the event, not after)
- Live slideshow mode for projectors/TVs at the venue
- Upload from gallery (not just camera capture)
- Digital guestbook (photos + messages/wishes)
- Content moderation (admin approves/hides before public display)
- B2B vendor dashboard for wedding organizers and photographers
- Unlimited or configurable shot limits (not fixed 10-25)

---

## Tech Stack

| Layer | Technology | Deployment |
|-------|-----------|------------|
| Frontend | Next.js (React, TypeScript) | Vercel |
| Database | PostgreSQL + Prisma ORM | VPS |
| Media Storage | Cloudinary (direct client upload) | Cloudinary CDN |
| Cache + Pub/Sub | Redis | VPS |
| Real-time | Server-Sent Events (SSE) | Next.js API Routes |
| Payment | Manual transfer (automation later) | - |

---

## User Roles

| Role | Login Required | Access |
|------|---------------|--------|
| Guest | No | Upload photos, view live feed |
| Host | Yes (email + password) | Manage own events |
| Vendor (WO/Photographer) | Yes (email + password) | Manage multiple events, custom branding |
| Super Admin | Yes (email + password) | Manage all events, vendors, platform settings |

---

## Core Features

### A. Guest App (Mobile-First)

#### A1. QR Code Scan and Instant Landing

Guest scans QR code at the venue, browser opens to the event landing page. No app download, no account required.

**Flow:**
1. Guest opens phone camera
2. Points at QR code on the table
3. Browser opens to `manunggal.com/g/{eventSlug}`
4. Landing page shows event name, date, and optional photo
5. Guest enters name (optional) and taps "Mulai Motret"

#### A2. Quick Name Tagging

Optional name input before uploading photos. Stored in localStorage, does not require account.

#### A3. Direct Camera Capture

Opens phone camera directly from browser. Supports front/back camera toggle. Shutter button captures photo. Preview before submit. Guest can add a message before sending.

#### A4. Gallery Upload

Multi-select from phone gallery. Supports batch upload (max 10 per batch). One message applies to all selected photos.

#### A5. Live Feed

Real-time gallery showing all uploaded photos. Auto-refresh via SSE (1-2 second latency). Reverse chronological order (newest first). Filter by guest name. No edit or delete by guest (final submission).

#### A6. Digital Guestbook

Photos paired with messages/wishes. Optional field, max 500 characters. Supports emoji. Messages cannot be edited after submission.

---

### B. Host Dashboard

#### B1. Event Management

Create, edit, and manage events. Event fields: title, slug, type, date, start/end time, venue. Status flow: draft, active, live, ended. Real-time stats: photo count, guest activity.

#### B2. QR Code and Signage Generator

Generate QR code with customizable design. Multiple signage templates (A4, A5, Square). PDF export for printing. QR encodes: `manunggal.com/g/{eventSlug}`.

#### B3. Content Moderation

Photos enter pending queue before appearing in live feed. Admin can approve, hide, or delete. Bulk actions: approve all, reject all. Settings: enable/disable moderation per event. Hidden photos remain in admin album but not in public feed.

#### B4. Bulk Download (ZIP Export)

Download all photos as ZIP. Options: original (full resolution) or compressed. Includes metadata JSON (guest name, timestamp, message). Progress bar during generation. Max 1000 photos per ZIP file.

#### B5. Live Slideshow Mode

Fullscreen mode for projectors/TVs. Real-time photo push via WebSocket. Configurable transitions: fade, slide, zoom. Interval: 3-10 seconds (configurable). Admin controls: pause, skip, stop.

---

### C. Vendor (B2B)

#### C1. Vendor Dashboard

Manage multiple events in one place. Stats: total events, photos, guests. List of all events with status. Create events for clients.

#### C2. Custom Branding

Upload vendor logo. Set accent color. Logo appears on guest landing page and live feed. "Powered by {Vendor Name}" in footer. Available for vendor subscription tier.

---

### D. System Features

#### D1. Authentication and Authorization

- Guest: no login required
- Host/Vendor/Admin: email + password with JWT tokens
- Token expiry: 7 days, auto-refresh
- Role-based access control (RBAC)

#### D2. Real-time Architecture

SSE (Server-Sent Events) for unidirectional server-to-client communication. Redis Pub/Sub for fan-out. Channels: `event:{eventId}:photos`. Events: `photo:new`, `photo:approved`, `photo:hidden`, `photo:deleted`, `slideshow:update`.

#### D3. Image Processing Pipeline

Direct client upload to Cloudinary via signed URLs. Server generates upload signature with timestamp and folder. Cloudinary auto-processes: resize (max 2048px), compress (quality 85%), WebP conversion, thumbnail generation (300px).

---

## Database Schema

### users

```
id: UUID (PK)
email: VARCHAR(255) UNIQUE NOT NULL
name: VARCHAR(255) NOT NULL
password: VARCHAR(255) NOT NULL (hashed)
role: ENUM('host', 'vendor', 'admin')
phone: VARCHAR(20) NULL
avatar_url: TEXT NULL
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### vendors

```
id: UUID (PK)
user_id: UUID (FK, UNIQUE)
company_name: VARCHAR(255) NOT NULL
logo_url: TEXT NULL
description: TEXT NULL
branding: JSONB DEFAULT '{}'
subscription: ENUM('free', 'pro', 'enterprise')
max_events: INTEGER NULL (NULL = unlimited)
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### events

```
id: UUID (PK)
host_id: UUID (FK)
vendor_id: UUID (FK) NULL
title: VARCHAR(255) NOT NULL
slug: VARCHAR(255) UNIQUE NOT NULL
event_type: ENUM('wedding', 'birthday', 'graduation', 'corporate', 'other')
description: TEXT NULL
date: DATE NOT NULL
start_time: TIME NOT NULL
end_time: TIME NOT NULL
venue: VARCHAR(255) NULL
status: ENUM('draft', 'active', 'live', 'ended') DEFAULT 'draft'
settings: JSONB DEFAULT '{}'
branding: JSONB DEFAULT '{}'
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### photos

```
id: UUID (PK)
event_id: UUID (FK)
file_key: VARCHAR(255) NOT NULL
file_url: TEXT NOT NULL
file_provider: ENUM('cloudinary', 's3', 'r2', 'local') DEFAULT 'cloudinary'
thumbnail_url: TEXT NOT NULL
guest_name: VARCHAR(255) NULL
guest_ip: VARCHAR(45) NULL
message: TEXT NULL
status: ENUM('pending', 'approved', 'hidden', 'deleted') DEFAULT 'pending'
metadata: JSONB DEFAULT '{}'
uploaded_at: TIMESTAMP DEFAULT NOW()
moderated_at: TIMESTAMP NULL
```

### orders

```
id: UUID (PK)
event_id: UUID (FK)
user_id: UUID (FK)
amount: INTEGER NOT NULL
package: ENUM('free', 'pro_event', 'vendor_monthly', 'vendor_yearly')
status: ENUM('pending', 'paid', 'expired', 'cancelled')
payment_method: VARCHAR(50) NULL
payment_proof_url: TEXT NULL
paid_at: TIMESTAMP NULL
expires_at: TIMESTAMP NULL
created_at: TIMESTAMP DEFAULT NOW()
```

### Indexes

```sql
CREATE INDEX idx_events_host_id ON events(host_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_photos_event_id ON photos(event_id);
CREATE INDEX idx_photos_status ON photos(status);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at);
CREATE INDEX idx_orders_event_id ON orders(event_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

---

## API Design

### Auth

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/me
```

### Events

```
GET    /api/events
POST   /api/events
GET    /api/events/:slug         (public, guest)
GET    /api/events/:id           (private, admin)
PUT    /api/events/:id
DELETE /api/events/:id
PATCH  /api/events/:id/status
```

### Photos

```
GET    /api/events/:eventId/photos
POST   /api/events/:eventId/photos
GET    /api/photos/:id
DELETE /api/photos/:id
PATCH  /api/photos/:id/status
POST   /api/events/:eventId/photos/bulk
```

### Upload

```
GET    /api/events/:eventId/upload-signature
```

### QR and Signage

```
GET    /api/events/:id/qr
GET    /api/events/:id/qr/download
GET    /api/events/:id/signage/:template
```

### Download

```
GET    /api/events/:id/download
```

### Vendor

```
GET    /api/vendor/dashboard
GET    /api/vendor/events
POST   /api/vendor/events
PUT    /api/vendor/branding
GET    /api/vendor/report/:eventId
```

### Slideshow

```
GET    /api/events/:id/slideshow
PUT    /api/events/:id/slideshow
PATCH  /api/events/:id/slideshow/pause
PATCH  /api/events/:id/slideshow/resume
```

### SSE Stream

```
GET    /api/events/:eventId/stream
```

### Response Format

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event tidak ditemukan"
  }
}
```

---

## Real-time Events (SSE)

Channel: `event:{eventId}:photos`

| Event | Payload | Description |
|-------|---------|-------------|
| photo:new | `{ photo }` | New photo uploaded |
| photo:approved | `{ photoId }` | Photo approved by admin |
| photo:hidden | `{ photoId }` | Photo hidden by admin |
| photo:deleted | `{ photoId }` | Photo deleted by admin |
| slideshow:update | `{ config }` | Slideshow settings changed |

---

## Component Structure

```
manunggal/
├── app/
│   ├── (marketing)/          ← Homepage, pricing, FAQ
│   ├── (auth)/               ← Login, register
│   ├── host/                 ← Admin dashboard
│   │   ├── events/
│   │   ├── moderation/
│   │   ├── vendor/
│   │   └── settings/
│   ├── g/[slug]/             ← Guest app (mobile-first)
│   │   ├── camera/
│   │   ├── upload/
│   │   └── feed/
│   ├── live/[slug]/          ← Slideshow mode
│   └── api/                  ← API routes
├── components/
│   ├── ui/                   ← Base UI (Button, Input, Card, Modal)
│   ├── host/                 ← Admin components
│   ├── guest/                ← Guest components
│   ├── live/                 ← Slideshow components
│   └── shared/               ← Shared components
├── lib/
│   ├── db.ts                 ← PostgreSQL + Prisma
│   ├── redis.ts              ← Redis connection
│   ├── cloudinary.ts         ← Cloudinary helpers
│   ├── auth.ts               ← JWT helpers
│   └── sse.ts                ← SSE helpers
├── hooks/
│   ├── useSSE.ts
│   ├── useUpload.ts
│   ├── useEvent.ts
│   └── useCamera.ts
└── styles/
    └── globals.css           ← Tailwind + design tokens
```

---

## Design System

### Color Palette

Primary:
- Blush: #D4A574
- Cream: #FDF6EC
- Gold: #C9A96E

Neutral:
- White: #FFFFFF
- Gray 50: #F9FAFB
- Gray 100: #F3F4F6
- Gray 200: #E5E7EB
- Gray 400: #9CA3AF
- Gray 600: #4B5563
- Gray 800: #1F2937
- Black: #111827

Semantic:
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Info: #3B82F6

### Typography

- Heading: Inter (bold)
- Body: Inter (regular)
- Hero: 48px
- H1: 36px
- H2: 30px
- H3: 24px
- Body: 16px
- Small: 14px
- Caption: 12px

### Responsive Breakpoints

- Mobile: 0-640px (guest app primary)
- Tablet: 641-1024px (dashboard sidebar collapse)
- Desktop: 1025px+ (host dashboard, slideshow)

---

## Implementation Phases

### Phase 0: Foundation (Week 1)

- Initialize Next.js project with TypeScript
- Setup Tailwind CSS + design tokens
- Setup PostgreSQL database + Prisma ORM
- Setup Cloudinary integration
- Setup Redis connection
- Authentication system (register, login, JWT)
- Base UI components (Button, Input, Card, Modal)
- Layout components (Header, Footer, Sidebar)

### Phase 1: Guest Core (Week 2-3)

- QR code generator
- Guest landing page (/g/{slug})
- Name input (optional)
- Camera capture (browser API)
- Gallery upload (multi-select)
- Direct upload to Cloudinary (signed upload)
- Photo metadata save to database
- SSE connection setup
- Live feed (real-time photo display)
- Guestbook (photos + messages)

### Phase 2: Host Dashboard (Week 3-4)

- Dashboard layout (sidebar, stats)
- Event list (CRUD)
- Event creation form
- Event detail page
- Photo grid (all photos per event)
- Content moderation (approve/hide/delete)
- Bulk download (ZIP export)
- Event settings (moderation toggle, max photos)

### Phase 3: Live Slideshow (Week 5) - COMPLETE

- [x] Slideshow page (/live/{slug})
- [x] Auto-rotate photos
- [x] Transitions (fade, slide, zoom)
- [x] Configurable interval
- [x] Admin controls (pause, skip, stop) - local overlay + remote from host dashboard
- [x] Real-time photo push (SSE over existing Redis photo channel + new slideshow control channel)

Shipped: fullscreen `/live/{slug}` page with a client slideshow engine (`hooks/useSlideshow`),
approved-photo streaming over SSE, config persisted in `event.settings.slideshow`
(`/api/events/[eventId]/slideshow/control`), control-stream SSE (`/api/live/[slug]/control-stream`),
and a host `SlideshowPanel` on the event detail page. Config and command payloads are typed in
`lib/types.ts`; config resolution lives in `lib/slideshow.ts`.

### Phase 4: QR Signage and Polish (Week 5-6)

- QR code customization (color, logo)
- Signage templates (A4, A5, Square)
- PDF export for printing
- Event type templates
- Error handling polish
- Loading states
- Mobile responsiveness polish

### Phase 5: Vendor B2B (Week 6-7)

- Vendor registration
- Vendor dashboard (multi-event view)
- Custom branding (logo, colors)
- Vendor-specific QR (with vendor logo)
- Export report for clients
- Vendor subscription management

### Phase 6: Monetization and Launch (Week 7-8)

- Manual payment flow (transfer + admin verify)
- Package management (free, pro, vendor)
- Payment proof upload
- Order management
- Final testing (all flows)
- Performance optimization
- Security audit
- Deploy to production

---

## Monetization

### Packages

Free/Starter:
- Max 50 photos
- Album access 7 days
- Basic features

Pro Event:
- IDR 150k-300k
- Unlimited photos
- 1 year storage
- Live Slideshow
- Bulk Download ZIP
- No watermark

Vendor Partnership:
- Monthly/yearly subscription
- Unlimited events
- Custom branding
- Vendor dashboard
- Priority support
