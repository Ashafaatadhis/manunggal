import { describe, it, expect } from "vitest";
import { resolveProxyAction } from "@/proxy";

describe("resolveProxyAction", () => {
  it("lets a logged-in user into /dashboard", () => {
    expect(resolveProxyAction("/dashboard", true)).toEqual({ type: "next" });
  });

  it("redirects an anonymous /dashboard visitor to /login", () => {
    expect(resolveProxyAction("/dashboard", false)).toEqual({
      type: "redirect",
      to: "/login",
    });
  });

  it("redirects a logged-in user away from /login", () => {
    expect(resolveProxyAction("/login", true)).toEqual({
      type: "redirect",
      to: "/dashboard",
    });
  });

  it("redirects a logged-in user away from /register", () => {
    expect(resolveProxyAction("/register", true)).toEqual({
      type: "redirect",
      to: "/dashboard",
    });
  });

  it("lets an anonymous visitor reach /login", () => {
    expect(resolveProxyAction("/login", false)).toEqual({ type: "next" });
  });

  it("lets an anonymous visitor reach /register", () => {
    expect(resolveProxyAction("/register", false)).toEqual({ type: "next" });
  });

  it("passes through unrelated public paths", () => {
    expect(resolveProxyAction("/", false)).toEqual({ type: "next" });
    expect(resolveProxyAction("/g/some-slug", false)).toEqual({ type: "next" });
  });

  it("handles nested dashboard paths", () => {
    expect(resolveProxyAction("/dashboard/events/abc", false)).toEqual({
      type: "redirect",
      to: "/login",
    });
    expect(resolveProxyAction("/dashboard/events/abc", true)).toEqual({
      type: "next",
    });
  });
});
