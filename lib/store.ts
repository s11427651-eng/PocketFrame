"use client";

import { useSyncExternalStore } from "react";
import { newId, type HighlightCollection, type Inspiration, type Memory, type Project } from "./types";
import { seedInspiration, seedMemories, seedProjects } from "./seed";

export { seedInspiration };

const PREFIX = "pf:";

export type DB = {
  memories: Memory[];
  projects: Project[];
  inspiration: Inspiration[];
  collections: HighlightCollection[];
  tags: string[];
  profile: { name: string; email: string; avatar_seed: number };
};

const DEFAULT: DB = {
  memories: [],
  projects: [],
  inspiration: [],
  collections: [
    { id: "c0", title: "Best of Taipei", description: "The essential Taipei frames.", memory_ids: ["m0", "m1", "m2"] },
    { id: "c1", title: "First Month Capturing", description: "Everything from early days.", memory_ids: ["m3", "m7", "m8"] },
    { id: "c2", title: "Night Walks", description: "Neon and shadows.", memory_ids: ["m3", "m15"] },
  ],
  tags: ["golden-hour", "night", "street", "travel", "food", "urban", "nature", "neon", "b-roll"],
  profile: { name: "Rafael", email: "rafael@pocketframe.app", avatar_seed: 3 },
};

let dbKey = PREFIX + "db";

function readKey(key: string): DB {
  if (typeof window === "undefined") return seeded();
  const raw = localStorage.getItem(key);
  if (!raw) return key.endsWith(":demo") ? seeded() : emptyUser();
  try {
    return JSON.parse(raw) as DB;
  } catch {
    return key.endsWith(":demo") ? seeded() : emptyUser();
  }
}

function load(): DB {
  return readKey(dbKey);
}

function emptyUser(): DB {
  return {
    memories: [],
    projects: [],
    collections: [],
    inspiration: JSON.parse(JSON.stringify(seedInspiration())),
    tags: [],
    profile: { name: "", email: "", avatar_seed: 1 },
  };
}

export function emptyDB(name: string, email: string): DB {
  return {
    ...emptyUser(),
    profile: { name: name || "Creator", email: email || "", avatar_seed: 1 },
  };
}

function seeded(): DB {
  const db: DB = {
    ...DEFAULT,
    memories: JSON.parse(JSON.stringify(seedMemories())),
    projects: JSON.parse(JSON.stringify(seedProjects())),
    inspiration: JSON.parse(JSON.stringify(seedInspiration())),
  };
  return db;
}

export function starterDB(wsId: string): DB {
  const s = seeded();
  return {
    ...s,
    memories: s.memories.map((m) => ({ ...m, workspace_id: wsId })),
    projects: s.projects.map((p) => ({ ...p, workspace_id: wsId })),
    collections: s.collections.map((c) => ({ ...c, workspace_id: wsId })),
  };
}

let db: DB = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(dbKey, JSON.stringify(db));
  listeners.forEach((l) => l());
  import("./sync").then((m) => m.schedulePush()).catch(() => {});
}

export function activateUser(username: string) {
  const oldKey = dbKey;
  dbKey = PREFIX + "db:" + (username || "demo");
  const next = readKey(dbKey);
  if (dbKey !== oldKey) db = next;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, () => db, () => DEFAULT);
}

export function getDB(): DB {
  return db;
}

let workspaceId = "";

export function setWorkspace(id: string) {
  workspaceId = id;
}

export const store = {
  addMemory(m: Omit<Memory, "id" | "uploaded_at">): Memory {
    const full: Memory = { ...m, id: newId(), uploaded_at: new Date().toISOString(), workspace_id: workspaceId || undefined };
    db = { ...db, memories: [full, ...db.memories] };
    if (m.tags) {
      const next = new Set([...db.tags, ...m.tags]);
      db.tags = [...next];
    }
    persist();
    return full;
  },
  updateMemory(id: string, patch: Partial<Memory>) {
    db = {
      ...db,
      memories: db.memories.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    };
    persist();
  },
  deleteMemory(id: string) {
    db = {
      ...db,
      memories: db.memories.filter((m) => m.id !== id),
      collections: db.collections.map((c) => ({ ...c, memory_ids: c.memory_ids.filter((x) => x !== id) })),
      projects: db.projects.map((p) =>
        p.cover_memory_id === id ? { ...p, cover_memory_id: null } : p
      ),
    };
    persist();
  },
  toggleHighlight(id: string, caption?: string) {
    db = {
      ...db,
      memories: db.memories.map((m) =>
        m.id === id
          ? { ...m, is_highlight: !m.is_highlight, highlight_caption: caption ?? m.highlight_caption }
          : m
      ),
    };
    persist();
  },
  addProject(p: Omit<Project, "id" | "created_at">): Project {
    const full: Project = { ...p, id: newId(), created_at: new Date().toISOString(), workspace_id: workspaceId || undefined };
    db = { ...db, projects: [full, ...db.projects] };
    persist();
    return full;
  },
  updateProject(id: string, patch: Partial<Project>) {
    db = { ...db, projects: db.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
    persist();
  },
  deleteProject(id: string) {
    db = {
      ...db,
      projects: db.projects.filter((p) => p.id !== id),
      memories: db.memories.map((m) => (m.project_id === id ? { ...m, project_id: null } : m)),
    };
    persist();
  },
  toggleShot(projectId: string, shotId: string) {
    db = {
      ...db,
      projects: db.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              shot_list: p.shot_list.map((s) =>
                s.id === shotId ? { ...s, completed: !s.completed } : s
              ),
            }
          : p
      ),
    };
    persist();
  },
  toggleFavoriteInspiration(id: string) {
    db = {
      ...db,
      inspiration: db.inspiration.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i)),
    };
    persist();
  },
  addCollection(c: Omit<HighlightCollection, "id">) {
    db = { ...db, collections: [...db.collections, { ...c, id: newId(), workspace_id: workspaceId || undefined }] };
    persist();
  },
  deleteCollection(id: string) {
    db = { ...db, collections: db.collections.filter((c) => c.id !== id) };
    persist();
  },
  setProfile(patch: Partial<DB["profile"]>) {
    db = { ...db, profile: { ...db.profile, ...patch } };
    persist();
  },
  reset() {
    db = seeded();
    persist();
  },
  replaceDB(next: DB) {
    db = next;
    persist();
  },
};
