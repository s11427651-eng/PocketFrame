"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDB, store } from "@/lib/store";
import { Icon } from "@/components/icons";
import { useAuth } from "@/components/auth";
import { fmtBytes } from "@/lib/format";
import { cloud } from "@/lib/cloud";
import { isCloudEnabled } from "@/lib/supabase";
import { pullAll } from "@/lib/sync";

export default function SettingsPage() {
  const db = useDB();
  const { logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(db.profile.name);
  const [accent, setAccent] = useState("purple");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [gridSize, setGridSize] = useState("4");
  const [vOrientation, setVOrientation] = useState("landscape");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ws, setWs] = useState<{ workspace_id: string; invite_code: string; workspaceName?: string } | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinMsg, setJoinMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const cloudOn = isCloudEnabled();

  useEffect(() => {
    if (cloudOn && !ws) {
      cloud.currentWorkspace().then((w) => setWs(w)).catch(() => {});
    }
  }, [cloudOn, ws]);

  async function doJoin() {
    if (!joinCode.trim()) return;
    const res = await cloud.joinWorkspace(joinCode);
    setJoinMsg(res.ok ? { ok: true, text: "Joined! Pulling shared memories…" } : { ok: false, text: res.error || "Could not join." });
    if (res.ok) {
      const w = await cloud.currentWorkspace();
      setWs(w);
      const data = await pullAll();
      const { seedInspiration } = await import("@/lib/store");
      const inspiration = seedInspiration().map((i) => ({ ...i, favorite: data.favoriteIds.includes(i.id) }));
      store.replaceDB({
        memories: data.memories,
        projects: data.projects,
        collections: data.collections.map((c) => ({ ...c, workspace_id: w!.workspace_id })),
        inspiration,
        tags: [...new Set(data.memories.flatMap((m) => m.tags))],
        profile: db.profile,
      });
    }
    setJoinCode("");
  }

  const totalBytes = db.memories.reduce((n, m) => n + m.file_size, 0);
  const max = 50 * 1024 * 1024 * 1024;
  const pct = Math.min(100, (totalBytes / max) * 100);

  function exportData() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pocketframe-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 rise">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <section className="card p-5 space-y-4">
        <h2 className="font-display font-bold">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-orange grid place-items-center text-white text-xl font-bold">
            {(name[0] || "R").toUpperCase()}
          </div>
          <div className="flex-1 space-y-2">
            <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => store.setProfile({ name: name || "Rafael" })} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40" placeholder="Display name" />
            <div className="text-sm text-slate-600">{db.profile.email}</div>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display font-bold mb-3">Storage usage</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">{fmtBytes(totalBytes)} used</span>
          <span className="text-slate-600">of 50 GB</span>
        </div>
        <div className="h-2 bg-black/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-display font-bold">Sharing & cloud</h2>
        {!cloudOn ? (
          <div className="text-sm">
            <p className="text-slate-600">
              Cloud is not configured yet. Add <code className="bg-black/5 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="bg-black/5 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable sharing your archive anywhere.
            </p>
            <p className="text-slate-600 mt-2">
              Right now data stays in this browser/device. When the cloud is on, you and your partner can share one workspace.
            </p>
          </div>
        ) : ws ? (
          <>
            <div className="text-sm text-slate-600">
              Workspace: <span className="font-semibold">{ws.workspaceName || "Shared"}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/15 p-4">
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-600 uppercase">Invite code</div>
                <div className="font-display text-2xl font-bold tracking-[0.3em] text-brand-purple select-all">{ws.invite_code}</div>
                <div className="text-xs text-slate-600 mt-1">Share this code so your partner can join your workspace.</div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter partner's code to join"
                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ring-brand-purple/40 uppercase tracking-widest"
              />
              <button onClick={doJoin} className="px-4 rounded-xl bg-brand-purple text-white text-sm font-medium">Join</button>
            </div>
            {joinMsg && (
              <div className={`text-sm rounded-xl px-3 py-2 ${joinMsg.ok ? "bg-emerald-500/10 text-emerald-900" : "bg-brand-pink/10 text-brand-pink"}`}>
                {joinMsg.text}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-slate-600">Checking cloud workspace…</div>
        )}
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-display font-bold">Appearance</h2>
        <Setting label="Accent color">
          <div className="flex gap-2">
            {["purple", "blue", "pink", "orange", "lime"].map((c) => (
              <button key={c} onClick={() => setAccent(c)} style={{ background: { purple: "#7c3aed", blue: "#2563eb", pink: "#ec4899", orange: "#fb923c", lime: "#a3e635" }[c] }} className={`w-8 h-8 rounded-full transition-transform ${accent === c ? "scale-110 ring-2 ring-offset-2 ring-ink" : ""}`} aria-label={c} />
            ))}
          </div>
        </Setting>
        <Setting label="Reduced motion">
          <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} className="accent-brand-purple w-5 h-5" />
        </Setting>
        <Setting label="Default grid size">
          <select value={gridSize} onChange={(e) => setGridSize(e.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none">
            {["2", "3", "4"].map((n) => <option key={n} value={n}>{n} columns</option>)}
          </select>
        </Setting>
        <Setting label="Preferred video orientation">
          <select value={vOrientation} onChange={(e) => setVOrientation(e.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none">
            {["landscape", "vertical"].map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
          </select>
        </Setting>
        <Setting label="Map provider">
          <select className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none">
            <option>OpenStreetMap</option>
            <option disabled>Mapbox (add key)</option>
          </select>
        </Setting>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-display font-bold">Data</h2>
        <button onClick={exportData} className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium hover:bg-black/5">
          <Icon name="download" className="w-4 h-4" /> Export all data (JSON)
        </button>
        <button onClick={() => store.reset()} className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium hover:bg-black/5">
          <Icon name="layers" className="w-4 h-4" /> Restore sample demo data
        </button>
      </section>

      <section className="card p-5 space-y-3 border-brand-pink/30">
        <h2 className="font-display font-bold text-brand-pink">Danger zone</h2>
        <button onClick={() => { logout(); router.replace("/login"); }} className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium hover:bg-black/5">
          <Icon name="logout" className="w-4 h-4" /> Sign out
        </button>
        {confirmDelete ? (
          <div className="rounded-xl bg-brand-pink/10 border border-brand-pink/30 p-3 space-y-3">
            <p className="text-sm">This permanently deletes all memories, projects, collections and inspiration in this browser. Not reversible.</p>
            <div className="flex gap-2">
              <button onClick={() => { store.reset(); localStorage.removeItem("pf:session"); logout(); router.replace("/login"); }} className="rounded-lg bg-brand-pink text-white px-4 py-2 text-sm font-semibold">Delete everything</button>
              <button onClick={() => setConfirmDelete(false)} className="rounded-lg border border-black/10 px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 rounded-xl border border-brand-pink/30 text-brand-pink px-4 py-2.5 text-sm font-medium hover:bg-brand-pink/5">
            <Icon name="trash" className="w-4 h-4" /> Delete my data
          </button>
        )}
      </section>
    </div>
  );
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-slate-600">{label}</span>
      {children}
    </div>
  );
}
