# Middleware to Proxy + Auth Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Next.js 16's deprecated `middleware` convention to `proxy`, point dashboard protection at the real `/dashboard` routes, and add missing `/login` and `/register` pages so the auth flow actually resolves.

**Architecture:** Rename `middleware.ts` → `proxy.ts` and its export `middleware` → `proxy` (the API is identical — same `NextRequest`/`NextResponse`/`config.matcher`, per bundled docs `01-app/01-getting-started/16-proxy.md`). Correct the protected/guest route lists so `/dashboard/:path*` is guarded (redirect to `/login`) and logged-in users visiting `/login`/`/register` go to `/dashboard`. Then add an `(auth)` route group with client login/register pages that call the existing `/api/auth/login` and `/api/auth/register` endpoints, and on success redirect to `/dashboard`. Reuse existing primitives (`components/ui/button.tsx`, `input.tsx`, `card.tsx`, `spinner.tsx`) and hooks (`hooks/useSession.ts`, react-query).

**Tech Stack:** Next.js 16.3.4 App Router, React 19 client components, TanStack Query, Tailwind v4, existing `@/lib/auth` (jose) + `@/lib/errors` helpers. No new runtime dependencies.

## Global Constraints

- Next 16: proxy runtime is `nodejs`; do NOT add `export const config = { runtime: "edge" }`. Docs: "edge runtime is NOT supported in proxy."
- Use the bundled docs as source of truth for proxy: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`, and auth-guide sections in `.../02-guides/authentication.md`.
- `proxy(request: NextRequest)` may be `async`; `config.matcher` unchanged from middleware.
- Follow the app's response envelope via `successResponse`/`errorResponse` in `lib/errors.ts`; reuse `useSession` hook + react-query `useQueryClient` for invalidation.
- No em dashes in copy. Indonesian UI text (match existing pages: "Masuk", "Daftar", "Coba Gratis").
- UI primitives from `components/ui/*` (base-ui), styled with Tailwind tokens (`primary`, `muted-foreground`, `border`, etc.).

---

### Task 1: Migrate `middleware.ts` → `proxy.ts` and fix the protected routes

**Files:**
- Rename: `middleware.ts` → `proxy.ts`
- Test: none (file-convention behavior is verified by build + manual route check)

**Interfaces:**
- Consumes: `verifyToken` from `@/lib/auth`, `NextRequest`/`NextResponse` from `next/server`.
- Produces: `proxy.ts` exporting `async function proxy(request: NextRequest)` and `config.matcher` covering `/dashboard`, `/login`, `/register`. Existing session logic preserved.

**Context:** Current `middleware.ts` guards `/host` (no longer a route — dashboard moved to `/dashboard` via route group `(dashboard)`) and redirects auth pages to `/host`. It must now guard `/dashboard/:path*` and redirect unauthenticated → `/login`, authenticated guests on `/login`|`/register` → `/dashboard`.

- [ ] **Step 1: Rename the file and update the export**

Run:
```bash
git mv middleware.ts proxy.ts
```

Then open `proxy.ts` and change the export declaration and docstring:

```diff
- export async function middleware(req: NextRequest) {
+ export async function proxy(req: NextRequest) {
```

- [ ] **Step 2: Fix the protected/auth route lists and redirect targets**

Current file content (after rename):
```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const protectedRoutes = ["/host"];
const authRoutes = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
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
      url.pathname = "/host";   // <-- fix to /dashboard
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/host/:path*", "/login", "/register"],  // <-- fix /host -> /dashboard
};
```

Change `protectedRoutes` from `["/host"]` to `["/dashboard"]`, and in the auth-redirect branch change `url.pathname = "/host"` to `url.pathname = "/dashboard"`. Update `config.matcher` to `["/dashboard/:path*", "/login", "/register"]`.

- [ ] **Step 3: Build to confirm proxy compiles and no middleware warning**

Run: `npm run build`
Expected: No "middleware file convention is deprecated" warning; `/dashboard`, `/login`, `/register` routes listed. Any `[ioredis]` unhandled error events during static generation are pre-existing (Redis not running) and non-blocking.

- [ ] **Step 4: Commit**

```bash
git add proxy.ts
git commit -m "refactor: migrate middleware to proxy and guard /dashboard"
```

---

### Task 2: Auth layout + `/login` and `/register` pages (server shells)

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `app/(auth)/login/LoginForm.tsx`
- Create: `app/(auth)/register/RegisterForm.tsx`

**Interfaces:**
- Consumes: existing `Button`, `Input`, `Spinner` primitives; `useRouter` from `next/navigation`; react-query `useMutation` + `useQueryClient`; existing `ApiResponse` type.
- Produces: two client form components and two server page shells. `/login` renders `LoginForm`; `/register` renders `RegisterForm`. After successful auth both call `useQueryClient().invalidateQueries({ queryKey: ["session"] })` then `router.push("/dashboard")`. Register also creates a session cookie (the `/api/auth/register` route already sets the token cookie) so the user is logged in immediately.

**Layout isolation:** `app/(auth)/layout.tsx` renders a centered card without the marketing `Header`/`Footer`, so auth pages are standalone. Keep root `app/layout.tsx` (Providers) wrapping.

- [ ] **Step 1: Create `app/(auth)/layout.tsx`**

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create the client `LoginForm` component**

`app/(auth)/login/LoginForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiResponse, User } from "@/lib/types";

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: ApiResponse<User> = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || "Gagal masuk");
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk</CardTitle>
        <CardDescription>Masuk ke dashboard acaramu</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMsg(null);
            loginMutation.mutate();
          }}
        >
          <div>
            <label className="text-sm text-muted-foreground" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? <Spinner /> : "Masuk"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary underline">
            Daftar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create the `/login` page shell**

`app/(auth)/login/page.tsx`:

```tsx
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return <LoginForm />;
}
```

- [ ] **Step 4: Create the client `RegisterForm`**

`app/(auth)/register/RegisterForm.tsx`: analogous to `LoginForm` but calls `/api/auth/register` with `{ name, email, password }` and has a Name field. Reuse the same mutation/redirect pattern. Follow the login form exactly but add a name field and a "Daftar" heading; on success invalidate `["session"]` and push `/dashboard` (the register API sets the token cookie).

- [ ] **Step 5: Create the `/register` page shell**

`app/(auth)/register/page.tsx`:

```tsx
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return <RegisterForm />;
}
```

- [ ] **Step 6: Build and run a smoke check**

Run: `npm run build`
Then, with the dev server running, `GET /login` and `GET /register` return 200 with the forms (not 404). Also confirm a logged-out request to `/dashboard` redirects to `/login` (proxy working) and a logged-in request to `/login` redirects to `/dashboard`.

- [ ] **Step 7: Commit**

```bash
git add 'app/(auth)/'
git commit -m "feat: add login and register pages with client forms"
```

---

### Task 3: Verify end-to-end auth flow

**Files:**
- Modify: none (verification only) unless a bug surfaces.
- Test: `tests/unit/validations.test.ts` already covers register/login schema (registerSchema/loginSchema). No new unit test required for thin pages; verification is via the dev server.

**Interfaces:**
- Consumes: full stack wired in Tasks 1–2.
- Produces: confirmation that a user can register, log out, log back in, and reach `/dashboard`.

- [ ] **Step 1: Verify the full flow manually**

With dev server running and DB up:
1. `POST /api/auth/register` with a fresh email → returns success, sets `token` cookie.
2. `GET /dashboard` with that cookie → 200 (proxy lets authed user through).
3. `POST /api/auth/logout` → clears cookie.
4. `GET /dashboard` without cookie → redirect to `/login` (proxy blocks).
5. `POST /api/auth/login` with the same credentials → success; `GET /dashboard` → 200.

- [ ] **Step 2: Clean up test rows**

Delete the smoke-test user from `manunggal` DB (like prior rounds) so no stray data remains.

- [ ] **Step 3: Commit any verification-time fixes** (if the flow exposed a bug in Task 1/2 code, fix + commit it in the same branch).

---

## Summary

Phase ships:
- `proxy.ts` (renamed from `middleware.ts`) guarding `/dashboard/:path*`, redirecting unauthenticated → `/login` and authed guests → `/dashboard`.
- New `(auth)` route group with `/login` and `/register` pages (client forms over existing `/api/auth/login|register`), reusing UI primitives + react-query, redirecting to `/dashboard` on success.
- No new dependencies; Next 16 proxy (nodejs runtime) used per bundled docs.
