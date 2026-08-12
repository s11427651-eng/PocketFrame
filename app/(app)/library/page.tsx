"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDB, store } from "@/lib/store";
import { MemoryCard } from "@/components/memorycard";
import { Icon } from "@/components/icons";
import { fmtDate, fmtBytes, fmtDuration } from "@/lib/format";
import type { Memory } from "@/lib/types";

const SORTS = ["newest", "oldest", "title", "date-taken"] as const;
const VIEWS = ["masonry", "grid"] as const;

export default function LibraryPage() {
  const db = useDB();
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") || "";
  const openId = params.get("m");

  const [text, setText] = useState(q);
  const [type, setType] = useState<"all" | "image" | "video">("all");
  const [favorite, setFavorite] = useState(false);
  const [tag, setTag] = useState("");
  const [place, setPlace] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("newest");
  const [view, setView] = useState<(typeof VIEWS)[number]>("masonry");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [multi, setMulti] = useState(false);

  const places = useMemo(() => {
    const s = new Set(db.memories.map((m) => m.city || m.location_name).filter(Boolean));
    return [...s].sort();
  }, [db.memories]);

  const filtered = useMemo(() => {
    const t = text.trim().toLowerCase();
    let list = db.memories.filter((m) => {
      if (type !== "all" && m.media_type !== type) return false;
      if (favorite && !m.is_highlight) return false;
      if (tag && !m.tags.includes(tag)) return false;
      if (place && (m.city || m.location_name) !== place) return false;
      if (t) {
        const hay = `${m.title} ${m.location_name} ${m.city} ${m.country} ${m.tags.join(" ")} ${m.notes}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "newest") return b.uploaded_at.localeCompare(a.uploaded_at);
      if (sort === "oldest") return a.uploaded_at.localeCompare(b.uploaded_at);
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.captured_at.localeCompare(a.captured_at);
    });
    return list;
  }, [db.memories, text, type, favorite, tag, place, sort]);

  const open = openId ? db.memories.find((m) => m.id === openId) : undefined;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <div className="space-y-5 rise">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold">Library</h1>
        <div className="flex-1" />
        {multi ? (
          <button
            onClick={() => {
              setMulti(false);
              setSelected(new Set());
            }}
            className="text-sm font-medium text-slate-600 hover:text-brand-pink"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setMulti(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:underline"
          >
            <Icon name="check" className="w-4 h-4" /> Select
          </button>
        )}
        {multi && selected.size > 0 && (
          <button
            onClick={() => {
              [...db.memories].filter((m: Memory) => selected.has(m.id)).forEach((m: Memory) => store.deleteMemory(m.id));
              setSelected(new Set());
            }}
            className="text-sm font-medium text-brand-pink hover:underline"
          >
            Delete ({selected.size})
          </button>
        )}
      </div>

      <div className="card p-3 space-y-3">
        <label className="flex items-center gap-2 bg-black/[0.04] rounded-full px-4 py-2 focus-within:ring-2 ring-brand-purple/40">
          <Icon name="search" className="w-4 h-4 text-slate-600" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-transparent text-sm w-full outline-none"
            placeholder="Search by title, place, tag, notes…"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {(["all", "image", "video"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1.5 font-medium capitalize transition-colors ${
                type === t ? "bg-ink text-white" : "bg-black/5 text-slate-600 hover:bg-black/10"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => setFavorite((f) => !f)}
            className={`rounded-full px-3 py-1.5 font-medium flex items-center gap-1 transition-colors ${
              favorite ? "bg-brand-pink text-white" : "bg-black/5 text-slate-600 hover:bg-black/10"
            }`}
          >
            <Icon name="star" className="w-4 h-4" /> Highlights
          </button>
          <select
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="rounded-full px-3 py-1.5 bg-black/5 text-slate-600 outline-none"
          >
            <option value="">All places</option>
            {places.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="rounded-full px-3 py-1.5 bg-black/5 text-slate-600 outline-none"
          >
            <option value="">All tags</option>
            {db.tags.sort().map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="flex-1" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full px-3 py-1.5 bg-black/5 text-slate-600 outline-none"
            aria-label="Sort"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>{s.replace("-", " ")}</option>
            ))}
          </select>
          <div className="flex rounded-full overflow-hidden border border-black/10">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={v}
                className={`px-3 py-1.5 ${view === v ? "bg-ink text-white" : "text-slate-600"}`}
              >
                <Icon name={v === "masonry" ? "layers" : "grid"} className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600">{filtered.length} memory{filtered.length === 1 ? "" : "ies"}</p>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-black/5 grid place-items-center">
            <Icon name="library" className="w-6 h-6 text-slate-600" />
          </div>
          <h2 className="font-display font-bold text-lg">Nothing here yet</h2>
          <p className="text-slate-600 text-sm">Try clearing filters, or add your first memory.</p>
        </div>
      ) : view === "masonry" ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
          {filtered.map((m) => (
            <div key={m.id} className="mb-3 break-inside-avoid relative">
              <MemoryCard memory={m} aspect={m.media_type === "video" ? "aspect-video" : (m.id.length % 2 ? "aspect-[4/5]" : "aspect-[4/3]")} />
              {multi && (
                <button
                  onClick={() => toggleSelect(m.id)}
                  className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full grid place-items-center border-2 text-white transition-colors ${
                    selected.has(m.id) ? "bg-brand-purple border-brand-purple" : "bg-black/40 border-white/80"
                  }`}
                  aria-label="Select"
                >
                  {selected.has(m.id) && <Icon name="check" className="w-4 h-4" />}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((m) => (
            <div key={m.id} className="relative">
              <MemoryCard memory={m} aspect="aspect-square" />
              {multi && (
                <button
                  onClick={() => toggleSelect(m.id)}
                  className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full grid place-items-center border-2 text-white ${
                    selected.has(m.id) ? "bg-brand-purple border-brand-purple" : "bg-black/40 border-white/80"
                  }`}
                  aria-label="Select"
                >
                  {selected.has(m.id) && <Icon name="check" className="w-4 h-4" />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {open && <MemoryViewer memory={open} onClose={() => router.replace("/library")} onPrev={() => prevNext(open, -1)} onNext={() => prevNext(open, 1)} />}
    </div>
  );

  function prevNext(open: Memory, dir: number) {
    const idx = filtered.findIndex((m) => m.id === open.id);
    const n = filtered[(idx + dir + filtered.length) % filtered.length];
    if (n) router.replace(`/library?m=${n.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
  }
}

function MemoryViewer({ memory, onClose, onPrev, onNext }: { memory: Memory; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const db = useDB();
  const [notes, setNotes] = useState(memory.notes);
  const project = memory.project_id ? db.projects.find((p) => p.id === memory.project_id) : null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 fadein" onClick={onClose}>
      <div className="relative grid md:grid-cols-[1fr_340px] max-h-[92vh] w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-black min-h-[40vh] md:min-h-full">
          {memory.media_type === "video" ? (
            <video src={memory.media_url} poster={memory.thumbnail} controls className="w-full h-full max-h-[92vh] object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={memory.media_url || memory.thumbnail} alt={memory.title} className="w-full h-full max-h-[92vh] object-contain" />
          )}
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white grid place-items-center hover:bg-black">
            <Icon name="close" />
          </button>
          <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black">
            <Icon name="chevronL" />
          </button>
          <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black">
            <Icon name="chevronR" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4 max-h-[92vh]">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-xl font-bold leading-tight">{memory.title}</h2>
            <button
              onClick={() => store.toggleHighlight(memory.id)}
              title="Toggle highlight"
              className={`p-2 rounded-full transition-colors ${memory.is_highlight ? "text-brand-pink" : "text-slate-300 hover:text-brand-pink"}`}
            >
              <Icon name="star" className={`w-5 h-5 ${memory.is_highlight ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-black/5 rounded-full px-2.5 py-1 flex items-center gap-1"><Icon name="places" className="w-3 h-3" />{memory.city || memory.location_name || "Unplaced"}</span>
            <span className="bg-black/5 rounded-full px-2.5 py-1 flex items-center gap-1"><Icon name="clock" className="w-3 h-3" />{fmtDate(memory.captured_at)}</span>
            {memory.media_type === "video" && memory.duration_seconds != null && (
              <span className="bg-black/5 rounded-full px-2.5 py-1 flex items-center gap-1"><Icon name="video" className="w-3 h-3" />{fmtDuration(memory.duration_seconds)}</span>
            )}
          </div>

          {(memory.latitude != null || memory.location_name) && (
            <div className="rounded-xl bg-gradient-to-r from-brand-blue/10 to-brand-cyan/10 border border-brand-blue/10 p-3 text-sm">
              <div className="flex items-center gap-1 font-semibold text-brand-blue"><Icon name="places" className="w-4 h-4" />Where taken</div>
              <div className="text-slate-600 mt-1">{memory.location_name || "Point on map"}</div>
              {memory.latitude != null && (
                <div className="text-xs text-slate-600 mt-1">{memory.latitude.toFixed(4)}, {memory.longitude?.toFixed(4)}</div>
              )}
            </div>
          )}

          {memory.notes && <p className="text-sm text-slate-600">{memory.notes}</p>}

          <label className="block">
            <span className="text-xs font-medium text-slate-600 uppercase">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => store.updateMemory(memory.id, { notes })}
              className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40 resize-none"
              rows={3}
              placeholder="Add context…"
            />
          </label>

          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {memory.tags.map((t) => (
                <span key={t} className="text-xs bg-brand-purple/10 text-brand-purple rounded-full px-2.5 py-1">#{t}</span>
              ))}
            </div>
          )}

          {project && (
            <div className="text-sm text-slate-600 flex items-center gap-1.5">
              <Icon name="projects" className="w-4 h-4 text-brand-purple" /> {project.title}
            </div>
          )}

          <dl className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-black/[0.03] rounded-xl p-3">
            <div><dt className="text-slate-600">File</dt><dd>{fmtBytes(memory.file_size)}</dd></div>
            {memory.device_name && <div><dt className="text-slate-600">Device</dt><dd>{memory.device_name}</dd></div>}
            <div><dt className="text-slate-600">Dimensions</dt><dd>{memory.width}×{memory.height}</dd></div>
            <div><dt className="text-slate-600">Type</dt><dd className="capitalize">{memory.media_type}</dd></div>
            <div><dt className="text-slate-600">Uploaded</dt><dd>{fmtDate(memory.uploaded_at)}</dd></div>
            <div><dt className="text-slate-600">Format</dt><dd className="break-all">{memory.mime_type}</dd></div>
          </dl>

          <a href={memory.media_url} download={memory.original_filename} className="inline-flex items-center gap-2 w-full justify-center rounded-xl border border-black/10 py-2 text-sm font-medium hover:bg-black/5">
            <Icon name="download" className="w-4 h-4" /> Download original
          </a>
          <button onClick={() => { store.deleteMemory(memory.id); onClose(); }} className="inline-flex items-center gap-2 w-full justify-center rounded-xl border border-brand-pink/20 text-brand-pink py-2 text-sm font-medium hover:bg-brand-pink/5">
            <Icon name="trash" className="w-4 h-4" /> Delete memory
          </button>
        </div>
      </div>
    </div>
  );
}
