"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApiResponse, User } from "@/lib/types";

export default function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data: ApiResponse<User> = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || "Gagal daftar");
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
    <Card className="border-0 bg-white shadow-[0_20px_70px_rgba(7,17,31,0.08)] ring-0">
      <CardHeader className="px-6 pt-7 sm:px-8 sm:pt-8">
        <CardTitle className="text-2xl tracking-tight">Mulai dari sini</CardTitle>
        <CardDescription className="mt-1">Buat akun untuk mengumpulkan foto di event pertamamu.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
        <form
           className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMsg(null);
            registerMutation.mutate();
          }}
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="name">
              Nama
            </label>
            <Input
              id="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Nama kamu"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errorMsg && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>}
          <Button
            type="submit"
            className="mt-2 h-11 w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? <Spinner /> : "Daftar"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary underline">
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
