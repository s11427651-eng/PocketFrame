import { cloud } from "./cloud";
import { getClient, isCloudEnabled, type Row } from "./supabase";
import type { DB } from "./store";
import type { HighlightCollection, Memory, Project } from "./types";

let timer: ReturnType<typeof setTimeout> | null = null;
let pulling = false;

export function schedulePush() {
  if (!isCloudEnabled() || pulling) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    timer = null;
    await pushAll((await import("./store")).getDB());
  }, 1200);
}

function stripBigMedia(db: DB): DB {
  const copy: DB = JSON.parse(JSON.stringify(db));
  for (const m of copy.memories) {
    if (m.media_url && m.media_url.startsWith("data:") && m.media_url.length > 200_000) {
      m.media_url = "";
    }
    if (m.thumbnail && m.thumbnail.startsWith("data:") && m.thumbnail.length > 60_000) {
      m.thumbnail = "";
    }
  }
  return copy;
}

export async function pushAll(input: DB): Promise<void> {
  if (!isCloudEnabled()) return;
  const ws = await cloud.currentWorkspace();
  if (!ws) return;
  const client = getClient();
  const wid = ws.workspace_id;
  const db = stripBigMedia(input);

  // wipe pushed favorites to mirror local state exactly
  // (workspace-scoped favorite_inspiration is per-user via payload upsert row)
  const favRows: Row[] = db.inspiration
    .filter((i) => i.favorite)
    .map((i) => ({ id: `fav:${i.id}`, workspace_id: wid, payload: { inspiration_id: i.id } }));

  const cols = [
    { table: "memories", rows: db.memories.map(toRow) },
    { table: "projects", rows: db.projects.map(toRow) },
    { table: "collections", rows: db.collections.map(toRow) },
    { table: "workspace_favorites", rows: favRows },
  ];

  for (const { table, rows } of cols) {
    const valid = rows.filter((r) => r.workspace_id);
    if (valid.length === 0) continue;
    await client.from(table).upsert(valid, { onConflict: "id" }).then(async ({ error }) => {
      if (error) console.warn(`[sync] push ${table} failed`, error.message);
    });
  }
}

function toRow(record: unknown): Row {
  const r = record as { id: string; workspace_id?: string };
  const { id, workspace_id: ws } = r;
  const payload: Record<string, unknown> = { ...r } as Record<string, unknown>;
  payload.id = id;
  payload.workspace_id = ws || "";
  return { id, workspace_id: ws || "", payload };
}

export async function pullAll(): Promise<{
  memories: Memory[];
  projects: Project[];
  collections: HighlightCollection[];
  favoriteIds: string[];
}> {
  const ws = await cloud.currentWorkspace();
  if (!ws) return { memories: [], projects: [], collections: [], favoriteIds: [] };
  const client = getClient();

  const { data: memories } = await client.from("memories").select("payload").eq("workspace_id", ws.workspace_id);
  const { data: projects } = await client.from("projects").select("payload").eq("workspace_id", ws.workspace_id);
  const { data: collections } = await client.from("collections").select("payload").eq("workspace_id", ws.workspace_id);
  const { data: favs } = await client.from("workspace_favorites").select("payload").eq("workspace_id", ws.workspace_id);

  return {
    memories: (memories || []).map((r) => r.payload as unknown as Memory),
    projects: (projects || []).map((r) => r.payload as unknown as Project),
    collections: (collections || []).map((r) => r.payload as unknown as HighlightCollection),
    favoriteIds: (favs || []).map((r) => (r.payload as unknown as { inspiration_id: string }).inspiration_id),
  };
}

export async function syncAfterLogin(name: string): Promise<void> {
  if (!isCloudEnabled()) return;
  pulling = true;
  try {
    const ws = await cloud.ensureWorkspace(name);
    const data = await pullAll();
    const { seedInspiration, starterDB } = await import("./store");
    const hasData = data.memories.length > 0 || data.projects.length > 0 || data.collections.length > 0;
    let next = {} as DB;
    if (!hasData) {
      // brand-new workspace: share the demo starter content
      next = starterDB(ws.workspace_id);
    } else {
      const base = seedInspiration();
      next = {
        memories: data.memories,
        projects: data.projects,
        collections: data.collections.map((c) => ({ ...c, workspace_id: ws.workspace_id })),
        inspiration: base.map((i) => ({ ...i, favorite: data.favoriteIds.includes(i.id) })),
        tags: extractTags(data.memories),
        profile: { name, email: "", avatar_seed: 1 },
      };
    }
    (await import("./store")).store.replaceDB(next);
    (await import("./store")).setWorkspace(ws.workspace_id);
    if (!hasData) await pushAll(next);
  } finally {
    pulling = false;
  }
}

function extractTags(memories: Memory[]): string[] {
  const set = new Set<string>();
  memories.forEach((m) => m.tags.forEach((t) => set.add(t)));
  return [...set];
}

export { isCloudEnabled };