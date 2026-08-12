"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your ID and password.");
      return;
    }
    const res = await login(username, password);
    if (!res.ok) {
      setError(res.error || "Login failed.");
      setShake((s) => s + 1);
      return;
    }
    router.replace("/");
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <span className="font-display text-2xl font-bold text-ink">PocketFrame</span>
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink">
          Your life, <span className="text-gradient">framed your way.</span>
        </h1>
        <p className="text-slate-600">
          The camera roll stores files. PocketFrame stores why they mattered — photos and video,
          pinned to places, saved as highlights, ready for your next idea.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold mb-1 block text-ink" htmlFor="username">
            ID
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
              <Icon name="home" className="w-4 h-4" />
            </span>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 ring-brand-purple/50 text-ink"
              placeholder="Your ID"
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-1 block text-ink" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
              <Icon name="settings" className="w-4 h-4" />
            </span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 ring-brand-purple/50 text-ink"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && (
          <div
            key={shake}
            role="alert"
            className="flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl px-4 py-3 shadow-lg shadow-red-500/30 pop"
          >
            <Icon name="close" className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-brand-purple w-4 h-4"
            />
            Remember me
          </label>
          <span className="text-slate-600">Guest access available</span>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl py-3.5 font-bold bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white shadow-lg shadow-brand-purple/40 hover:shadow-xl hover:-translate-y-px hover:brightness-105 transition-all"
        >
          Sign in
        </button>

        <p className="text-sm text-center text-slate-600">
          No account yet?{" "}
          <Link href="/register" className="font-semibold text-brand-purple hover:underline">
            Create one — it&apos;s free
          </Link>
        </p>

        <p className="text-xs text-slate-600 text-center">
          Private archive. Your media and data stay yours.
        </p>
      </form>
    </div>
  );
}

const FEATURES = [
  { icon: "camera" as const, t: "Capture & store", d: "Photos and video in one private home." },
  { icon: "places" as const, t: "Where did you take it?", d: "Pin every memory to a place on a map." },
  { icon: "highlight" as const, t: "Highlights", d: "Save and replay the moments that matter." },
  { icon: "inspiration" as const, t: "Inspiration Lab", d: "Generate boards and shot ideas in seconds." },
];

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 sm:p-12">
          <LoginForm />
        </div>
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-ink via-[#1e1b4b] to-brand-purple text-white relative overflow-hidden">
          <div className="blob blob-b -top-20 -right-20 w-96 h-96" />
          <div className="blob blob-c bottom-10 -left-10 w-80 h-80" />
          <div className="blob blob-a top-1/2 left-1/2 w-96 h-96" />
          <div className="relative">
            <Logo className="w-12 h-12" />
          </div>
          <div className="relative space-y-6">
            <h2 className="font-display text-3xl font-bold leading-tight text-white">
              Your visual journal <span className="text-cyan-300">+</span> creator companion.
            </h2>
            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f.t} className="flex items-start gap-4 glass rounded-2xl p-4 border border-white/20">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-white/15 grid place-items-center text-white">
                    <Icon name={f.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{f.t}</div>
                    <div className="text-sm text-white/80">{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="relative text-sm text-white/80 font-medium">
            Keep the footage. Remember the feeling.
          </p>
        </div>
      </div>
    </AuthProvider>
  );
}
