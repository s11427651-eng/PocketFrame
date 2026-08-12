"use client";

import { useState } from "react";
import { useDB, store } from "@/lib/store";
import { Icon } from "@/components/icons";
import type { Inspiration } from "@/lib/types";

const CATS = ["All", "Camera Movement", "Composition", "Transition", "Story", "Time of Day", "Travel", "Indoor", "Food", "Street", "B-Roll", "Challenge", "Subject", "Light", "Movement", "Editing", "Cinematic B-Roll"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function InspirationPage() {
  const db = useDB();
  const [cat, setCat] = useState("All");
  const [favOnly, setFavOnly] = useState(false);
  const [mission, setMission] = useState<Inspiration | null>(null);

  const [c, setC] = useState({ mood: "calm", loc: "street", dur: "10–15 min", subject: "strangers", move: "slow push-in", tod: "golden hour", energy: "low", company: "solo", orient: "both" });

  const items = db.inspiration.filter((i) => (cat === "All" || i.category === cat) && (!favOnly || i.favorite));

  function generate() {
    const pool = db.inspiration.filter((i) => {
      const moodOk = !i.moods.length || i.moods.some((m) => m === c.mood || i.summary.toLowerCase().includes(c.mood));
      return moodOk;
    });
    const base = pool.length ? pick(pool) : pick(db.inspiration);
    const mission: Inspiration = {
      ...base,
      shotList: base.shotList,
      movement: base.movement || c.move,
    };
    setMission(mission);
  }

  return (
    <div className="space-y-8 rise">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-purple via-brand-blue to-brand-cyan text-white p-8 sm:p-10">
        <div className="blob blob-c -top-10 -right-10 w-72 h-72" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-white/80 font-medium"><Icon name="inspiration" className="w-4 h-4" /> Inspiration Lab</div>
          <h1 className="font-display text-3xl font-bold mt-2">Don&apos;t know what to film?</h1>
          <p className="text-white/75 mt-2 max-w-xl">
            Roll a shooting mission, or browse structured shot recipes. Every idea is a plan, not a placeholder.
          </p>
        </div>
      </div>

      <section className="card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Icon name="dice" className="w-5 h-5 text-brand-purple" />
          <h2 className="font-display text-lg font-bold">Prompt builder</h2>
          <span className="text-xs text-slate-600 ml-auto">Build a filming mission</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Mood" value={c.mood} onChange={(v) => setC({ ...c, mood: v })} options={["calm", "dynamic", "moody", "playful", "dreamy", "intimate", "energetic", "minimal"]} />
          <Field label="Location type" value={c.loc} onChange={(v) => setC({ ...c, loc: v })} options={["street", "indoor", "outdoor", "travel", "cafe", "urban", "food"]} />
          <Field label="Duration target" value={c.dur} onChange={(v) => setC({ ...c, dur: v })} options={["1–5 min", "10–15 min", "20–40 min", "1 hour", "full day"]} />
          <Field label="Subject" value={c.subject} onChange={(v) => setC({ ...c, subject: v })} options={["strangers", "nature", "food", "architecture", "hands", "light", "friends"]} />
          <Field label="Camera movement" value={c.move} onChange={(v) => setC({ ...c, move: v })} options={["slow push-in", "orbit", "handheld", "walking", "static", "whip pan", "tracking"]} />
          <Field label="Time of day" value={c.tod} onChange={(v) => setC({ ...c, tod: v })} options={["golden hour", "blue hour", "midday", "night", "morning"]} />
          <Field label="Energy" value={c.energy} onChange={(v) => setC({ ...c, energy: v })} options={["low", "medium", "high"]} />
          <Field label="Company" value={c.company} onChange={(v) => setC({ ...c, company: v })} options={["solo", "friends"]} />
          <Field label="Orientation" value={c.orient} onChange={(v) => setC({ ...c, orient: v })} options={["both", "landscape", "vertical"]} />
        </div>
        <button onClick={generate} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold shadow-lg hover:-translate-y-px transition-all">
          <Icon name="dice" /> Generate filming mission
        </button>

        {mission && <Mission mission={mission} c={c} onClose={() => setMission(null)} />}
      </section>

      <section>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {CATS.map((x) => (
            <button key={x} onClick={() => setCat(x)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${cat === x ? "bg-ink text-white" : "bg-black/5 text-slate-600 hover:bg-black/10"}`}>
              {x}
            </button>
          ))}
          <button onClick={() => setFavOnly((f) => !f)} className={`rounded-full px-3 py-1.5 text-sm font-medium flex items-center gap-1 ${favOnly ? "bg-brand-pink text-white" : "bg-black/5 text-slate-600"}`}>
            <Icon name="star" className="w-4 h-4" /> Favorites
          </button>
        </div>

        {items.length === 0 ? (
          <div className="card p-12 text-center text-slate-600 text-sm">No ideas in this category{favOnly ? " saved as favorites" : ""}.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((i) => (
              <IdeaCard key={i.id} idea={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600 uppercase">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function IdeaCard({ idea }: { idea: Inspiration }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-4 flex flex-col">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-purple">{idea.category}</span>
          <h3 className="font-display font-bold leading-tight">{idea.title}</h3>
        </div>
        <button onClick={() => store.toggleFavoriteInspiration(idea.id)} className={`p-1.5 rounded-lg transition-colors ${idea.favorite ? "text-brand-pink" : "text-slate-300 hover:text-brand-pink"}`} aria-label="Favorite">
          <Icon name="star" className={`w-5 h-5 ${idea.favorite ? "fill-current" : ""}`} />
        </button>
      </div>
      <p className="text-sm text-slate-600 mt-1 flex-1">{idea.summary}</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className="text-xs bg-black/5 px-2 py-0.5 rounded-full capitalize">{idea.difficulty}</span>
        <span className="text-xs bg-black/5 px-2 py-0.5 rounded-full">{idea.durationRange}</span>
        <span className="text-xs bg-black/5 px-2 py-0.5 rounded-full capitalize">{idea.orientation}</span>
      </div>
      <button onClick={() => setOpen((o) => !o)} className="mt-3 text-sm font-medium text-brand-purple hover:underline self-start">
        {open ? "Hide plan" : "View shot plan"}
      </button>
      {open && <ShotPlan idea={idea} />}
    </div>
  );
}

function ShotPlan({ idea }: { idea: Inspiration }) {
  return (
    <div className="mt-3 pt-3 border-t border-black/5 space-y-2 text-sm">
      {idea.movement && <Row k="Movement" v={idea.movement} />}
      {idea.shotList.length > 0 && (
        <div>
          <div className="text-xs font-medium text-slate-600 uppercase">Sequence</div>
          <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-slate-600">
            {idea.shotList.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}
      {idea.transition && <Row k="Transition" v={idea.transition} />}
      {idea.soundIdea && <Row k="Sound" v={idea.soundIdea} />}
      {idea.editingTip && <Row k="Editing tip" v={idea.editingTip} />}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div><span className="text-xs font-medium text-slate-600 uppercase">{k}: </span><span className="text-slate-600 capitalize">{v}</span></div>
  );
}

function Mission({ mission, c, onClose }: { mission: Inspiration; c: { mood: string; loc: string; dur: string; subject: string; move: string; tod: string; energy: string; company: string; orient: string }; onClose: () => void }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/15 p-5 space-y-4 fadein">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase text-brand-purple">Your filming mission</span>
          <h3 className="font-display text-xl font-bold mt-1">{mission.title}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-600"><Icon name="close" /></button>
      </div>
      <p className="text-sm text-slate-600">{mission.summary}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <Chip>{c.mood} mood</Chip>
        <Chip>{c.loc} location</Chip>
        <Chip>{c.tod}</Chip>
        <Chip>{c.dur}</Chip>
        <Chip>{c.subject}</Chip>
        <Chip>{c.company}</Chip>
        <Chip>{c.energy} energy</Chip>
        <Chip>{c.orient}</Chip>
      </div>
      <div className="font-display font-bold">Concept</div>
      <p className="text-sm text-slate-600">
        Film {mission.title.toLowerCase()} at {c.tod} with a {c.move || mission.movement} feel, focused on {c.subject}. Keep the energy {c.energy}, shoot {c.orient}, and aim for {c.dur}.
      </p>
      <div className="font-display font-bold">Recommended sequence</div>
      <ol className="list-decimal ml-4 space-y-1 text-sm text-slate-600">
        {mission.shotList.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {mission.transition && <div><span className="text-xs uppercase font-medium text-slate-600">Transition: </span><span className="capitalize">{mission.transition}</span></div>}
        {mission.soundIdea && <div><span className="text-xs uppercase font-medium text-slate-600">Sound: </span><span>{mission.soundIdea}</span></div>}
        {mission.editingTip && <div className="sm:col-span-2"><span className="text-xs uppercase font-medium text-slate-600">Editing: </span><span>{mission.editingTip}</span></div>}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="bg-white rounded-full px-3 py-1 border border-black/10 font-medium capitalize">{children}</span>;
}
