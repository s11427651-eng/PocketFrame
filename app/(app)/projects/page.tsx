"use client";

import { useState } from "react";
import { useDB, store } from "@/lib/store";
import { Icon } from "@/components/icons";
import { fmtBytes, fmtDate } from "@/lib/format";
import { newId, type Project } from "@/lib/types";

const TEMPLATES = [
  { title: "7 Days of Ordinary", desc: "One small ordinary moment, filmed beautifully, every day for a week.", goal: "Capture the beauty of routine.", shots: ["Morning kettle", "Window dust", "Coffee pour", "Street crossing", "Evening lamp"] },
  { title: "One Place, One Minute", desc: "A single breathtaking minute at one location.", goal: "Paint a full mood board in 60 seconds.", shots: ["Wide establishing", "Wave close-up", "Path POV walk"] },
  { title: "Camera Move Library", desc: "Practice each move once, cleanly.", goal: "Build a personal movement library.", shots: ["Push-in", "Orbit", "Whip pan", "Tracking", "Dolly"] },
  { title: "Monthly Life Reel", desc: "One shot a day, cut into a monthly reel.", goal: "Document this month.", shots: ["Day 1", "Day 2", "Day 3"] },
  { title: "Food Story", desc: "Film one dish from raw to plated.", goal: "Appetizing short film.", shots: ["Ingredients", "Sizzle", "Hands", "Plating", "Reveal"] },
  { title: "Night Walk", desc: "A cinematic night walk through lit streets.", goal: "Moody night short.", shots: ["Neon bokeh", "Rain reflections", "Lit shopfronts", "Headlight trails"] },
  { title: "Travel Day", desc: "Capture a full travel day in six shots.", goal: "Efficient travel vlog.", shots: ["Departure", "Transit", "Arrival", "First meal", "Evening walk"] },
];

export default function ProjectsPage() {
  const db = useDB();
  const [showNew, setShowNew] = useState(false);
  const [openProject, setOpenProject] = useState<Project | null>(null);

  return (
    <div className="space-y-6 rise">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Projects</h1>
          <p className="text-slate-600 text-sm">Plan shoots, build shot lists, tie memories to goals.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-medium shadow-lg">
          <Icon name="plus" className="w-4 h-4" /> New project
        </button>
      </div>

      {db.projects.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-black/5 grid place-items-center"><Icon name="projects" className="w-6 h-6 text-slate-600" /></div>
          <p className="text-slate-600 text-sm">No projects yet. Start from a template or build from scratch.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {db.projects.map((p) => {
            const done = p.shot_list.filter((s) => s.completed).length;
            const total = p.shot_list.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            const covers = db.memories.filter((m) => m.project_id === p.id);
            return (
              <a key={p.id} href={`/projects?id=${p.id}`} onClick={(e) => { e.preventDefault(); setOpenProject(p); }} className="card p-4 hover:shadow-lg hover:-translate-y-px transition-all">
                <div className="flex items-start justify-between">
                  <div className="font-display text-sm uppercase tracking-wide text-slate-600">{p.status}</div>
                  <button onClick={(e) => { e.preventDefault(); store.deleteProject(p.id); }} className="p-1.5 text-slate-300 hover:text-brand-pink" aria-label="Delete"><Icon name="trash" className="w-4 h-4" /></button>
                </div>
                <h3 className="font-display text-lg font-bold">{p.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mt-1">{p.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-lime" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-600">{pct}%</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-3">
                  <span className="flex items-center gap-1"><Icon name="check" className="w-3 h-3" />{done}/{total} shots</span>
                  {covers.length > 0 && <span className="flex items-center gap-1"><Icon name="camera" className="w-3 h-3" />{covers.length} memories</span>}
                </div>
              </a>
            );
          })}
        </div>
      )}

      {showNew && <NewProject onClose={() => setShowNew(false)} />}
      {openProject && <ProjectDetail project={openProject} onClose={() => setOpenProject(null)} />}
    </div>
  );
}

function NewProject({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [useTemplate, setUseTemplate] = useState<string | null>(null);

  function create() {
    const tpl = TEMPLATES.find((t) => t.title === useTemplate);
    const finalTitle = title || tpl?.title || "Untitled project";
    const shots = (tpl?.shots || []).map((s, i) => ({ id: newId(), title: s, notes: "", completed: false, order_index: i }));
    store.addProject({
      title: finalTitle,
      description: desc || tpl?.desc || "",
      status: "active",
      due_date: null,
      goal: goal || tpl?.goal || "",
      location: "",
      moodboard: [],
      notes: "",
      cover_memory_id: null,
      shot_list: shots,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 fadein" onClick={onClose}>
      <div className="bg-paper w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">New project</h2>
          <button onClick={onClose} className="p-2 text-slate-600 hover:bg-black/5 rounded-lg"><Icon name="close" /></button>
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-slate-600 uppercase mb-2">Start from template</div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button key={t.title} onClick={() => setUseTemplate(useTemplate === t.title ? null : t.title)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${useTemplate === t.title ? "bg-brand-purple text-white" : "bg-black/5 text-slate-600 hover:bg-black/10"}`}>
                {t.title}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ring-brand-purple/40" placeholder="Project title" />
          <input value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ring-brand-purple/40" placeholder="Goal (optional)" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ring-brand-purple/40 resize-none" rows={2} placeholder="Description" />
        </div>

        <button onClick={create} className="mt-5 w-full rounded-xl py-3 font-semibold bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg hover:-translate-y-px transition-all">
          Create project
        </button>
      </div>
    </div>
  );
}

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const db = useDB();
  const [title, setTitle] = useState(project.title);
  const [notes, setNotes] = useState(project.notes);
  const [newShot, setNewShot] = useState("");
  const covers = db.memories.filter((m) => m.project_id === project.id);
  const done = project.shot_list.filter((s) => s.completed).length;
  const total = project.shot_list.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 fadein" onClick={onClose}>
      <div className="absolute right-0 inset-y-0 w-full max-w-xl bg-paper shadow-2xl p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm uppercase tracking-wide text-slate-600">{project.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { store.deleteProject(project.id); onClose(); }} className="p-2 text-slate-600 hover:text-brand-pink" aria-label="Delete"><Icon name="trash" /></button>
            <button onClick={onClose} className="p-2 text-slate-600 hover:bg-black/5 rounded-lg"><Icon name="close" /></button>
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => store.updateProject(project.id, { title: title || "Untitled" })}
          className="w-full font-display text-2xl font-bold bg-transparent border-b border-transparent focus:border-brand-purple outline-none py-1"
        />
        <p className="text-slate-600 text-sm mt-1">{project.description}</p>

        <div className="card p-4 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-slate-600">{done}/{total} shots · {pct}%</span>
          </div>
          <div className="h-2 bg-black/10 rounded-full overflow-hidden mt-2">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-lime transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <section className="mt-5">
          <h3 className="font-display font-bold mb-2">Shot list</h3>
          <div className="space-y-2">
            {project.shot_list.map((s) => (
              <div key={s.id} className="flex items-center gap-3 card px-3 py-2.5">
                <button
                  onClick={() => store.toggleShot(project.id, s.id)}
                  className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${s.completed ? "bg-brand-purple border-brand-purple text-white" : "border-slate-300"}`}
                  aria-label="Toggle"
                >
                  {s.completed && <Icon name="check" className="w-3 h-3" />}
                </button>
                <span className={`text-sm ${s.completed ? "line-through text-slate-600" : ""}`}>{s.title}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={newShot}
              onChange={(e) => setNewShot(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newShot.trim()) {
                  store.updateProject(project.id, { shot_list: [...project.shot_list, { id: newId(), title: newShot.trim(), notes: "", completed: false, order_index: project.shot_list.length }] });
                  setNewShot("");
                }
              }}
              className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40"
              placeholder="Add a shot…"
            />
            <button
              onClick={() => {
                if (!newShot.trim()) return;
                store.updateProject(project.id, { shot_list: [...project.shot_list, { id: newId(), title: newShot.trim(), notes: "", completed: false, order_index: project.shot_list.length }] });
                setNewShot("");
              }}
              className="px-4 rounded-xl bg-brand-purple text-white text-sm font-medium"
            >
              Add
            </button>
          </div>
        </section>

        {covers.length > 0 && (
          <section className="mt-5">
            <h3 className="font-display font-bold mb-2">Connected memories ({covers.length})</h3>
            <div className="space-y-2">
              {covers.map((m) => (
                <div key={m.id} className="card p-2.5 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium line-clamp-1">{m.title}</div>
                    <div className="text-xs text-slate-600">{fmtDate(m.captured_at)} · {fmtBytes(m.file_size)}</div>
                  </div>
                  <button onClick={() => store.updateMemory(m.id, { project_id: null })} className="text-xs text-slate-600 hover:text-brand-pink">Detach</button>
                </div>
              ))}
            </div>
          </section>
        )}

        <label className="block mt-5">
          <span className="text-xs font-medium text-slate-600 uppercase">Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => store.updateProject(project.id, { notes })} className="w-full mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40 resize-none" rows={3} placeholder="Project notes…" />
        </label>
      </div>
    </div>
  );
}
