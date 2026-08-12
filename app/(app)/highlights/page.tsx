"use client";

import { useMemo, useState } from "react";
import { useDB, store } from "@/lib/store";
import { Icon } from "@/components/icons";
import { fmtDate } from "@/lib/format";

export default function HighlightsPage() {
  const db = useDB();
  const highlights = db.memories.filter((m) => m.is_highlight);
  const [filter, setFilter] = useState<{ col: string; loc: string; year: string }>({ col: "all", loc: "all", year: "all" });
  const [playing, setPlaying] = useState<string | null>(null);

  const years = useMemo(() => [...new Set(db.memories.map((m) => new Date(m.captured_at).getFullYear()))].sort().reverse(), [db.memories]);
  const places = useMemo(() => [...new Set(highlights.map((m) => m.city || m.location_name).filter(Boolean))].sort(), [highlights]);
  const collections = db.collections;

  const filtered = highlights.filter((m) => {
    if (filter.col !== "all" && !(db.collections.find((c) => c.id === filter.col)?.memory_ids.includes(m.id))) return false;
    if (filter.loc !== "all" && (m.city || m.location_name) !== filter.loc) return false;
    if (filter.year !== "all" && new Date(m.captured_at).getFullYear() !== Number(filter.year)) return false;
    return true;
  });

  function collectionMemories(c: (typeof collections)[0]) {
    return c.memory_ids.map((id) => db.memories.find((m) => m.id === id)).filter(Boolean);
  }

  return (
    <div className="space-y-8 rise">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-pink via-brand-purple to-brand-blue text-white p-8 sm:p-12">
        <div className="blob blob-d -bottom-16 -right-10 w-72 h-72" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
            <Icon name="star" className="w-4 h-4 fill-current" /> Highlights
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">
            {highlights.length} moment{highlights.length === 1 ? "" : "s"} worth keeping
          </h1>
          <p className="text-white/70 mt-2 max-w-lg">
            The frames that stopped you. Rewatch them, group them, keep them close.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={filter.loc} onChange={(e) => setFilter({ ...filter, loc: e.target.value })} className="rounded-full px-3 py-1.5 bg-white border border-black/10 text-sm outline-none">
          <option value="all">All places</option>
          {places.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filter.year} onChange={(e) => setFilter({ ...filter, year: e.target.value })} className="rounded-full px-3 py-1.5 bg-white border border-black/10 text-sm outline-none">
          <option value="all">All years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filter.col} onChange={(e) => setFilter({ ...filter, col: e.target.value })} className="rounded-full px-3 py-1.5 bg-white border border-black/10 text-sm outline-none">
          <option value="all">All collections</option>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {collections.length > 0 && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => {
            const mems = collectionMemories(c);
            return (
              <div key={c.id} className="card p-4 space-y-3">
                <div className="grid grid-cols-3 gap-1.5 h-24 rounded-xl overflow-hidden">
                  {[mems[0], mems[1], mems[2]].map((m, i) => (
                    <div key={i} className="bg-black">
                      {m && (
                        m.media_type === "video" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.thumbnail} alt="" className="w-full h-full object-cover" />
                        )
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-display font-bold">{c.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                  <div className="text-xs text-slate-600 mt-1">{c.memory_ids.length} memories</div>
                </div>
                <button
                  onClick={() => playReel(c)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-purple hover:underline"
                >
                  <Icon name="play" className="w-4 h-4" /> Play reel
                </button>
              </div>
            );
          })}
        </section>
      )}

      {playing && <CinematicPlayer id={playing} onClose={() => setPlaying(null)} />}

      <section>
        <h2 className="font-display text-lg font-bold mb-3">Highlight reel</h2>
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Icon name="star" className="w-8 h-8 mx-auto text-slate-300" />
            <p className="mt-3 text-slate-600 text-sm">No highlights match this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((m) => (
              <div key={m.id} className="card overflow-hidden group">
                <div className="relative aspect-[4/3] bg-black">
                  {m.media_type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover" />
                  ) : (
                    <video src={m.media_url} poster={m.thumbnail} muted className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => setPlaying(m.id)}
                    className="absolute inset-0 bg-black/0 hover:bg-black/30 grid place-items-center text-white opacity-0 group-hover:opacity-100 transition"
                    aria-label="Play"
                  >
                    <div className="w-12 h-12 rounded-full bg-black/60 grid place-items-center backdrop-blur"><Icon name="play" className="w-5 h-5" /></div>
                  </button>
                  <button
                    onClick={() => store.toggleHighlight(m.id)}
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-brand-pink text-white grid place-items-center shadow"
                    aria-label="Remove highlight"
                  >
                    <Icon name="star" className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold line-clamp-1">{m.title}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Icon name="places" className="w-3 h-3" />{m.city || m.location_name} · {fmtDate(m.captured_at)}
                  </div>
                  {m.highlight_caption && <div className="text-xs text-slate-600 mt-1 line-clamp-2 italic">“{m.highlight_caption}”</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="text-center py-4">
        <button onClick={() => setPlaying("reel-all")} className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-ink text-white font-semibold hover:bg-slate-800 transition-colors">
          <Icon name="play" className="w-5 h-5" /> Play chronological reel
        </button>
      </section>
    </div>
  );

  function playReel(c: (typeof collections)[0]) {
    setPlaying(`col:${c.id}`);
  }
}

function CinematicPlayer({ id, onClose }: { id: string; onClose: () => void }) {
  const db = useDB();
  let list = db.memories.filter((m) => m.is_highlight);
  if (id.startsWith("col:")) {
    const cid = id.slice(4);
    const c = db.collections.find((x) => x.id === cid);
    if (c) list = c.memory_ids.map((i) => db.memories.find((m) => m.id === i)).filter((m): m is NonNullable<typeof m> => !!m);
  }
  const ordered = [...list].sort((a, b) => a.captured_at.localeCompare(b.captured_at));
  const [i, setI] = useState(0);
  const m = ordered[i];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col fadein" onClick={onClose}>
      <div className="absolute top-4 left-4 flex items-center gap-3 z-10 text-white">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20"><Icon name="close" /></button>
        <div>
          <div className="font-display font-bold">{m?.title}</div>
          <div className="text-xs text-white/50">{m?.city}, {m?.country}</div>
        </div>
      </div>
      <button onClick={onClose} className="absolute top-8 right-8 z-10 text-white/60 hover:text-white">
        <Icon name="close" className="w-6 h-6" />
      </button>
      <div className="flex-1 grid place-items-center p-6" onClick={(e) => e.stopPropagation()}>
        {m && (
          m.media_type === "video" ? (
            <video key={m.id} src={m.media_url} poster={m.thumbnail} controls autoPlay className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.media_url || m.thumbnail} alt={m.title} className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain" />
          )
        )}
      </div>
      <div className="flex items-center justify-center gap-4 pb-8">
        <button disabled={i === 0} onClick={() => setI(i - 1)} className="w-10 h-10 rounded-full bg-white/10 text-white grid place-items-center disabled:opacity-30 hover:bg-white/20"><Icon name="chevronL" /></button>
        <span className="text-white/60 text-sm">{i + 1} / {ordered.length}</span>
        <button disabled={i === ordered.length - 1} onClick={() => setI(i + 1)} className="w-10 h-10 rounded-full bg-white/10 text-white grid place-items-center disabled:opacity-30 hover:bg-white/20"><Icon name="chevronR" /></button>
      </div>
    </div>
  );
}
