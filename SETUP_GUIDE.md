# PocketFrame Setup Guide — Bigger free space (Supabase + Cloudinary)

Goal: your app online, shared with your partner, with **10 GB free** for photos & videos.

Cost: **$0.** No credit card needed. Three accounts: GitHub, Supabase, Cloudflare (and Vercel for hosting).

## What goes where

| Piece | Service | Free space | Holds |
|---|---|---|---|
| Login | Supabase Auth | — | accounts |
| Database | Supabase Postgres | 500 MB | metadata (tiny: titles, places, tags, notes) |
| **Photos + Videos (original)** | **Cloudinary** | **25 GB** | the big files |
| Hosting | Vercel | — | the website |

No credit card needed. DB only holds metadata, so its 500 MB ≈ basically unlimited. Cloudinary's 25 GB is your media headroom.

---

## Phase 1 — GitHub (holds your code)

1. Go to `github.com` → Sign up → verify email.
2. Tell me your GitHub username.

Then push this project (I'll give exact commands when you're ready, or I run them for you):

```bash
cd ~/Documents/Rafael/PocketFrame
git init && git add . && git commit -m "init"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/PocketFrame.git
git push -u origin main
```

(You'll create the empty repo named `PocketFrame` on GitHub first.)

## Phase 2 — Supabase (login + database + thumbnails)

1. Go to `supabase.com` → Sign up → **New project**.
2. Name: `PocketFrame`, set a strong **database password** (save it somewhere safe), nearest region to you.
3. Wait ~2 min while it creates.
4. Open **SQL Editor → New Query** → paste the whole file `supabase/schema.sql` from this project → **Run**. Must say success.
5. Left menu → **Project Settings → API**. Copy:
   - `Project URL` (starts `https://xxxx.supabase.co`)
   - `anon public` key (the long `eyJ...` one)
6. In this project, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
```

> Cloudinary values are added in Phase 3. Keep them empty for now.

Test locally:

```bash
npm run dev
```

Register a fresh account → open **Settings → Sharing & cloud** → see your invite code.

## Phase 3 — Cloudinary (the 25 GB media box, no credit card)

1. Go to `cloudinary.com` → **Sign up** (free).
2. On the first screen you'll see your **Cloud name** (like `dz7abcxyz`). Copy it.
3. Dashboard → **Settings** (gear) → **Upload** tab → scroll to **Unsigned Upload Presets** → **Add unsigned upload preset** → give it any name (e.g. `pocketframe`) → keep defaults → **Save**.
4. Copy the preset **name**.
5. Put both into `.env.local`:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_PRESET=your-preset-name
```

> ⚠️ Keep `.env.local` and its secrets private. Never push it to GitHub.

## Phase 4 — Vercel (put it online)

1. Go to `vercel.com` → **Sign up with GitHub** → import your `PocketFrame` repo.
2. Vercel auto-detects Next.js → **Deploy**. First URL: `https://pocketframe.vercel.app` (free).
3. Add env vars in Vercel: **Project → Settings → Environment Variables** — all 4 from `.env.local` (Supabase ×2, Cloudinary ×2).
4. **Redeploy** → the online site now uses Supabase + Cloudinary.

## Phase 5 — Phone + partner

1. On your phone, open `https://pocketframe.vercel.app`.
2. Browser menu → **Add to Home Screen**. Now it's an app (iPhone, Android, tablet — any resolution).
3. Partner: registers own account → **Settings → Sharing & cloud** → types your **invite code** → Join.
4. You both see the same memories. Changes sync automatically.

---

## Deploying updates later

```bash
vercel --prod    # or: push to GitHub, Vercel auto-builds
```

## When you hit the 25 GB wall (much later)

Archive old clips or move media to Cloudflare R2 (10 GB free, needs a card) — the storage layer swaps with a tiny change.

## I'm here for each step

Do **Phase 1** first (GitHub), tell me when done → I'll help push the code, then walk Phase 2 and beyond with you one step at a time.