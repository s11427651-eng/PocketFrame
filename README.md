# PocketFrame

Your life, framed your way. A private visual journal + creator companion, storing **why** a moment mattered — not just its file.

> The camera roll stores files. PocketFrame stores why they mattered.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Client-side data layer (localStorage) — instant, credential-free demo
- `exifr` for EXIF/GPS metadata, `react-leaflet` + OpenStreetMap for the map
- Service-layer design so Supabase/R2 can drop in later (see `lib/store.ts`)

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

Sign in with any email + a 4+ char password. Seed demo data loads automatically (memories, places, highlights, projects, 30 inspiration ideas).

## Go online + share

Full walkthrough in **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** — Supabase DB/storage, Vercel deploy, couple sharing via invite code, PWA install on phones.

## Pages

| Route | Purpose |
|---|---|
| `/login` | Auth + bio/passkey-ready placeholder |
| `/` | Dashboard: stats, recent uploads, today's shot idea, recent places, active projects |
| `/library` | Media grid — filter (type/highlight/place/tag), sort, search, multi-select, detail viewer |
| `/upload` | Drag-drop → per-file "**Where did you take it?**" flow, EXIF GPS, thumbnails, progress |
| `/highlights` | Cinematic favorites, collections, chronological reel play mode |
| `/places` | Interactive map, clustered markers, "places filmed most" |
| `/inspiration` | Prompt builder → structured filming mission + 30 shot recipes |
| `/projects` | Shot lists, goals, templates, connected memories |
| `/about` | What & why |
| `/settings` | Profile, appearance, storage, data export/reset, danger zone |

## Data layer (`lib/store.ts`)

`useDB()` + `store.*` write-through to localStorage. Swap the bodies of `store.addMemory`, `updateMemory`, etc. for Supabase/R2 calls to go live — page code and types (`lib/types.ts`) stay unchanged. Binary media is stored as data URLs only when small (≤1.5 MB), so large files persist metadata but not binary in this local demo.

`ponytail:` real uploads need object storage (`users/{userId}/originals/{year}/{month}/{uuid}.{ext}`) + signed URLs + multipart. Add when connecting Supabase Storage/R2.

## Env vars

`SUPABASE_URL`, `SUPABASE_ANON_KEY` — optional, unused until backend is wired. See `.env.example`.

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm run start` — production build/serve
- `npm run lint` — eslint
