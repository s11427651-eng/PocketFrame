# PocketFrame Setup Guide — Bigger free space (Supabase + Cloudflare R2)

Goal: your app online, shared with your partner, with **10 GB free** for photos & videos.

Cost: **$0.** No credit card needed. Three accounts: GitHub, Supabase, Cloudflare (and Vercel for hosting).

## What goes where

| Piece | Service | Free space | Holds |
|---|---|---|---|
| Login | Supabase Auth | — | accounts |
| Database | Supabase Postgres | 500 MB | metadata (tiny: titles, places, tags, notes) |
| Thumbnails | Supabase Storage | 1 GB | small preview images |
| **Photos + Videos (original)** | **Cloudflare R2** | **10 GB** | the big files |

DB only holds metadata, so its 500 MB ≈ basically unlimited. R2's 10 GB is your real headroom for media.

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
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
```

Test locally:

```bash
npm run dev
```

Register a fresh account → open **Settings → Sharing & cloud** → see your invite code.

## Phase 3 — Cloudflare R2 (the 10 GB media box)

1. Go to `dash.cloudflare.com` → Sign up.
2. Left menu → **R2 Object Storage** → activate, confirm.
3. **Create bucket** → name it `pocketframe-media` → keep **Private** → Create.
4. Copy your **Account ID** (bottom-left in R2 dashboard).
5. **Manage R2 API Tokens** → **Create API token** → just create one with **Object Read & Write**, valid 50 years. Copy:
   - **Access Key ID**
   - **Secret Access Key** (shown once — save it)
6. Now make the bucket reachable: open the bucket → **Settings** → **Public access** → enable, and note the **Public bucket URL** (a free `https://xxx.r2.dev` address — no paid domain needed). Copy it; this is how the app loads media.
7. Put the values into the same `.env.local`:

```bash
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET=pocketframe-media
NEXT_PUBLIC_R2_PUBLIC_URL=https://xxx.r2.dev
```

> ⚠️ Keep `.env.local` and its secrets private. Never push it to GitHub.

## Phase 4 — Vercel (put it online)

1. Go to `vercel.com` → **Sign up with GitHub** → import your `PocketFrame` repo.
2. Vercel auto-detects Next.js → **Deploy**. First URL: `https://pocketframe.vercel.app` (free).
3. Add env vars in Vercel: **Project → Settings → Environment Variables** — all 7 from `.env.local`.
4. **Redeploy** → the online site now uses Supabase + R2.

Blocked-free note: on Vercel, big uploads need the server to sign uploads. I'll wire that (a few lines) once you confirm keys.

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

## When you hit the 10 GB wall (much later)

Upgrade R2 storage (cheap, few $/mo) or archive old clips to Backblaze (also free 10 GB). No code change.

## I'm here for each step

Do **Phase 1** first (GitHub), tell me when done → I'll help push the code, then walk Phase 2 and beyond with you one step at a time.