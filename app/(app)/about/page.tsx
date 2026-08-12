"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { useDB } from "@/lib/store";

export default function AboutPage() {
  const db = useDB();
  const memories = db.memories.length;
  const highlights = db.memories.filter((m) => m.is_highlight).length;
  const places = new Set(db.memories.map((m) => m.city || m.location_name).filter(Boolean)).size;
  const ideas = db.inspiration.length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 rise">
      <section className="text-center space-y-4 py-8">
        <h1 className="font-display text-4xl font-bold">
          The camera roll stores files. <span className="text-gradient">PocketFrame stores why they mattered.</span>
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          A private visual journal + creator companion. Not a cloud drive — a
          home for the moments worth keeping.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6">
          {[
            { v: memories, l: "memories" },
            { v: places, l: "places" },
            { v: highlights, l: "highlights" },
            { v: ideas, l: "shot ideas" },
          ].map((s) => (
            <div key={s.l} className="card p-4">
              <div className="text-3xl font-display font-bold text-gradient">{s.v}</div>
              <div className="text-xs text-slate-600 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {[
          { icon: "library" as const, t: "An archive with context", d: "Every upload keeps its story — a title, a place, a date, notes. Not just a file in a folder." },
          { icon: "places" as const, t: "Memories by place", d: "Pinned to a real map. Ask where a shot lives and watch your travel history take shape." },
          { icon: "highlight" as const, t: "Personal highlights", d: "First-class favorites. Group them into collections and replay them cinematically." },
          { icon: "inspiration" as const, t: "Inspiration when you're stuck", d: "Roll a structured filming mission or browse shot recipes built for a Pocket creator." },
          { icon: "projects" as const, t: "Project planning", d: "Shot lists, goals, and connected memories. Turn a vague idea into a plan." },
          { icon: "settings" as const, t: "Private-first", d: "Your media stays yours by default. Signed URLs and row-level security keep it that way." },
        ].map((f) => (
          <div key={f.t} className="card p-5 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-purple/15 to-brand-cyan/15 text-brand-purple grid place-items-center shrink-0">
              <Icon name={f.icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold">{f.t}</h3>
              <p className="text-sm text-slate-600 mt-0.5">{f.d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="text-center py-6">
        <Link href="/upload" className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold shadow-lg hover:-translate-y-px transition-all">
          <Icon name="plus" className="w-5 h-5" /> Start a memory
        </Link>
      </section>
    </div>
  );
}
