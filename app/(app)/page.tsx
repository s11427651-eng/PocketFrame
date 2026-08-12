"use client";

import Link from "next/link";
import { useDB } from "@/lib/store";
import { Icon } from "@/components/icons";
import { fmtDate } from "@/lib/format";
import { MemoryCard } from "@/components/memorycard";

export default function HomePage() {
  const db = useDB();
  const memories = db.memories;
  const highlights = memories.filter((m) => m.is_highlight);
  const places = new Map<string, number>();
  memories.forEach((m) => {
    const key = m.city || m.location_name || "Unknown";
    places.set(key, (places.get(key) || 0) + 1);
  });
  const topPlaces = [...places.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const activeProjects = db.projects.filter((p) => p.status === "active");
  const recent = [...memories].sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at)).slice(0, 4);
  const featured = highlights[0];
  const todayIdea = db.inspiration[new Date().getDate() % db.inspiration.length];

  const hours = new Date().getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 rise">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-slate-900 to-brand-purple text-white p-6 sm:p-10">
        <div className="blob blob-c -top-16 -right-16 w-72 h-72" />
        <div className="blob blob-a bottom-0 left-1/3 w-80 h-80" />
        <div className="relative space-y-6">
          <div>
            <p className="text-sm text-white/60">{greeting},</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">
              {db.profile.name.split(" ")[0]}. Let&apos;s keep the footage.
            </h1>
            <p className="text-white/70 mt-2 max-w-lg">
              Keep the footage. Remember the feeling. Here&apos;s your visual journal at a glance.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 bg-white text-ink font-semibold shadow-lg hover:-translate-y-px hover:shadow-xl transition-all"
          >
            <Icon name="plus" className="w-5 h-5" />
            Add a memory
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: "camera" as const, label: "Memories", value: memories.length, href: "/library" },
          { icon: "places" as const, label: "Places", value: topPlaces.length, href: "/places" },
          { icon: "highlight" as const, label: "Highlights", value: highlights.length, href: "/highlights" },
          { icon: "projects" as const, label: "Active projects", value: activeProjects.length, href: "/projects" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-px transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-purple/15 to-brand-cyan/15 text-brand-purple grid place-items-center">
              <Icon name={s.icon} className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-display font-bold leading-none">{s.value}</div>
              <div className="text-xs text-slate-600 mt-0.5">{s.label}</div>
            </div>
          </Link>
        ))}
      </section>

      {featured && (
        <section className="card relative overflow-hidden p-5 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="h-32 w-full sm:w-56 rounded-2xl overflow-hidden shrink-0 bg-black">
            <video
              src={featured.media_url}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
              playsInline
              poster={featured.thumbnail}
            />
          </div>
          <div className="sm:flex-1">
            <div className="flex items-center gap-2 text-brand-pink font-semibold text-sm">
              <Icon name="star" className="w-4 h-4 fill-current" />
              Featured highlight
            </div>
            <h2 className="font-display text-xl font-bold mt-1">{featured.title}</h2>
            <p className="text-slate-600 text-sm mt-1">
              {featured.highlight_caption || "A memory worth keeping."}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-3">
              <span className="flex items-center gap-1">
                <Icon name="places" className="w-3.5 h-3.5" />
                {featured.city}, {featured.country}
              </span>
              <span>{fmtDate(featured.captured_at)}</span>
            </div>
          </div>
          <Link
            href="/highlights"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium bg-brand-pink/10 text-brand-pink hover:bg-brand-pink/20 transition-colors"
          >
            View
            <Icon name="chevronR" className="w-4 h-4" />
          </Link>
        </section>
      )}

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent uploads</h2>
            <Link href="/library" className="text-sm text-brand-purple hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recent.map((m) => (
              <MemoryCard key={m.id} memory={m} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <section className="card p-5">
            <div className="flex items-center gap-2 text-brand-purple font-semibold text-sm">
              <Icon name="inspiration" className="w-5 h-5" />
              Today&apos;s shot idea
            </div>
            <h3 className="font-display text-lg font-bold mt-2">{todayIdea.title}</h3>
            <p className="text-slate-600 text-sm mt-1">{todayIdea.summary}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {todayIdea.moods.slice(0, 3).map((m) => (
                <span key={m} className="text-xs bg-black/5 rounded-full px-2.5 py-1">
                  {m}
                </span>
              ))}
            </div>
            <Link
              href="/inspiration"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:underline"
            >
              <Icon name="dice" className="w-4 h-4" />
              Find a new idea
            </Link>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-600">
                Recent places
              </h2>
              <Link href="/places" className="text-xs text-brand-purple font-medium hover:underline">
                See map
              </Link>
            </div>
            <div className="space-y-2">
              {topPlaces.map(([p, count]) => (
                <div key={p} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan text-white grid place-items-center">
                    <Icon name="places" className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{p}</div>
                    <div className="text-xs text-slate-600">{count} {" "}memory{count > 1 ? "ies" : "y"}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {activeProjects.length > 0 && (
            <section className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-600">
                  Active projects
                </h2>
                <Link href="/projects" className="text-xs text-brand-purple font-medium hover:underline">
                  All
                </Link>
              </div>
              {activeProjects.map((p) => {
                const done = p.shot_list.filter((s) => s.completed).length;
                const total = p.shot_list.length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                return (
                  <Link key={p.id} href={`/projects?id=${p.id}`} className="block mb-3 last:mb-0">
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-lime"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{pct}%</span>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </div>
      </section>

      <section className="text-center py-6">
        <Link
          href="/inspiration"
          className="inline-flex items-center gap-2 text-brand-purple hover:underline font-medium"
        >
          <Icon name="dice" className="w-5 h-5" />
          Feeling stuck? Roll a random filming mission.
        </Link>
      </section>
    </div>
  );
}
