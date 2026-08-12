"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await register(form);
    if (!res.ok) {
      setError(res.error || "Could not create account.");
      setShake((s) => s + 1);
      return;
    }
    router.replace("/");
  }

  const field =
    "w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-purple/50 text-ink";
  const label = "text-sm font-semibold mb-1 block text-ink";

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <span className="font-display text-2xl font-bold text-ink">PocketFrame</span>
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink">
          Create your <span className="text-gradient">account.</span>
        </h1>
        <p className="text-slate-600">
          Set up your private visual journal. Save once — come back anytime.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label} htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={field} placeholder="Rafael" autoComplete="name" />
          </div>
          <div>
            <label className={label} htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={field} placeholder="you@example.com" autoComplete="email" />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="username">ID</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"><Icon name="home" className="w-4 h-4" /></span>
            <input id="username" value={form.username} onChange={(e) => set("username", e.target.value)} className={`${field} pl-10`} placeholder="Choose an ID (min 3 chars)" autoComplete="username" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label} htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className={field} placeholder="Min 6 characters" autoComplete="new-password" />
          </div>
          <div>
            <label className={label} htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} className={field} placeholder="Repeat password" autoComplete="new-password" />
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

        <button
          type="submit"
          className="w-full rounded-xl py-3.5 font-bold bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white shadow-lg shadow-brand-purple/40 hover:shadow-xl hover:-translate-y-px hover:brightness-105 transition-all"
        >
          Create account
        </button>

        <p className="text-sm text-center text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-brand-purple hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 sm:p-12">
          <RegisterForm />
        </div>
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-purple via-[#1e1b4b] to-ink text-white relative overflow-hidden">
          <div className="blob blob-b -top-20 -left-20 w-96 h-96" />
          <div className="blob blob-d bottom-16 -right-16 w-96 h-96" />
          <div className="relative"><Logo className="w-12 h-12" /></div>
          <div className="relative space-y-5">
            <h2 className="font-display text-3xl font-bold leading-tight text-white">
              One account. <span className="text-cyan-300">Every memory.</span>
            </h2>
            <ul className="space-y-3 text-sm">
              {[
                "Your photos and video in one private home",
                "Every clip pinned to a real place on the map",
                "Highlights you can replay like a film",
                "Shot ideas when you don’t know what to film",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-white/90">
                  <span className="w-6 h-6 mt-0.5 shrink-0 rounded-full bg-cyan-400/20 text-cyan-300 grid place-items-center"><Icon name="check" className="w-3.5 h-3.5" /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-sm text-white/80 font-medium">Keep the footage. Remember the feeling.</p>
        </div>
      </div>
    </AuthProvider>
  );
}
