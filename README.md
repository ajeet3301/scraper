# 🕷️ Universal Scraper API Builder

Turn any website into a REST API — no Python, no server, no Docker. Pure Next.js, deployed entirely on Vercel.

---

## 🚀 Deploy in 10 Minutes — Step by Step

### STEP 1 — Push this folder to GitHub

```bash
cd universal-scraper-api-builder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

> Replace `YOUR_USERNAME/YOUR_REPO` with your actual GitHub repo URL. Create an empty repo first at [github.com/new](https://github.com/new) if you haven't already.

---

### STEP 2 — Get a free database (Supabase)

1. Go to **[supabase.com](https://supabase.com)** → sign up → **New Project**
2. Set a database password (save it!) → choose a region → **Create project** (~2 min)
3. Once ready, go to **Settings → Database → Connection string**
4. Copy **two** strings:
   - **Transaction pooler** (port 6543) → use as `DATABASE_URL`
   - **Session pooler / Direct connection** (port 5432) → use as `DIRECT_URL`

They look like:
```
DATABASE_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres
```

> 💡 Free Supabase projects pause after 7 days with zero traffic. Visiting your app occasionally keeps it active.

---

### STEP 3 — Generate your auth secret

Run this on your computer (or use any random string generator):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output — this is your `NEXTAUTH_SECRET`.

---

### STEP 4 — Connect Vercel to GitHub

1. Go to **[vercel.com](https://vercel.com)** → sign up/log in with GitHub
2. Click **Add New… → Project**
3. **Import** the GitHub repo you pushed in Step 1
4. Vercel auto-detects Next.js — leave all build settings as default
5. **Don't click Deploy yet** — first add the environment variables below ⬇️

---

### STEP 5 — Add these exact keys in Vercel

In the Vercel import screen, expand **Environment Variables** and add each of these:

| Key | Value | Where to get it |
|-----|-------|------------------|
| `DATABASE_URL` | `postgresql://postgres.xxxx:[PASSWORD]@...:6543/postgres?pgbouncer=true` | Supabase (Step 2) |
| `DIRECT_URL` | `postgresql://postgres.xxxx:[PASSWORD]@...:5432/postgres` | Supabase (Step 2) |
| `NEXTAUTH_SECRET` | the random hex string | Step 3 |
| `NEXTAUTH_URL` | `https://your-project-name.vercel.app` | Your Vercel URL (use a placeholder first, update after deploy) |

Optional (skip for now, add later if wanted):

| Key | Value |
|-----|-------|
| `GITHUB_CLIENT_ID` | from github.com/settings/applications/new |
| `GITHUB_CLIENT_SECRET` | same place |
| `GOOGLE_CLIENT_ID` | from console.cloud.google.com |
| `GOOGLE_CLIENT_SECRET` | same place |
| `FIRECRAWL_API_KEY` | from firecrawl.dev (for JS-heavy site scraping) |

Click **Deploy**.

> ⚠️ **Important:** When adding environment variables in Vercel, make sure the **Production**, **Preview**, and **Development** checkboxes are all selected (Vercel shows these as toggles next to each variable). If you only check "Production," your preview deployments and `vercel dev` will fail with database connection errors.

---

### STEP 6 — Fix the NEXTAUTH_URL after first deploy

1. Once deployed, Vercel gives you a URL like `https://universal-scraper-xyz.vercel.app`
2. Go to **Project → Settings → Environment Variables**
3. Edit `NEXTAUTH_URL` → paste your **real** Vercel URL
4. Go to **Deployments** tab → click **⋯** on the latest deployment → **Redeploy**

---

### STEP 7 — Set up the database tables

You need to run Prisma migrations once. Easiest way — from your local machine:

```bash
# In your project folder, create a temporary .env file:
echo 'DATABASE_URL="paste_your_DATABASE_URL_here"' > .env
echo 'DIRECT_URL="paste_your_DIRECT_URL_here"' >> .env

npm install
npx prisma migrate deploy
npx prisma db seed   # optional — adds demo account
```

> The included `.npmrc` file automatically handles peer dependency resolution for React 19, so plain `npm install` works without extra flags.

This creates all the tables in your Supabase database.

> Alternative: if you don't have Node locally, use Supabase's **SQL Editor** to run the migration SQL found in `prisma/migrations/` after generating it once locally with `npx prisma migrate dev`.

---

### STEP 8 — Open your app! 🎉

Visit your Vercel URL → click **Get Started** → sign up → paste any URL → watch it become an API.

If you ran the seed step, you can also log in with:
```
demo@example.com / demo123456
```

---

## 🔁 Future updates

Every time you push to `main`, Vercel **automatically redeploys**:

```bash
git add .
git commit -m "Update something"
git push
```

That's it — no manual redeploy needed after the first setup.

---

## 🔑 Adding GitHub / Google Login (Optional)

### GitHub OAuth
1. [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Homepage URL: `https://your-app.vercel.app`
3. Callback URL: `https://your-app.vercel.app/api/auth/callback/github`
4. Copy **Client ID** + generate **Client Secret**
5. Add both to Vercel env vars → redeploy

### Google OAuth
1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth Client ID → Web application
3. Authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
4. Copy **Client ID** + **Client Secret**
5. Add both to Vercel env vars → redeploy

---

## 🔥 Scraping JS-Heavy Sites (React/Vue/SPAs)

The built-in scraper (Cheerio) handles most static and server-rendered sites well. For JavaScript-heavy single-page apps:

1. Get a free key at **[firecrawl.dev](https://firecrawl.dev)** (500 free credits/month)
2. Add `FIRECRAWL_API_KEY` to Vercel env vars → redeploy
3. When creating a project, select **Firecrawl** as the engine

---

## 📁 Project Structure

```
universal-scraper-api-builder/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts               # Demo data
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/               # Login / Signup
│   │   ├── dashboard/          # Main app
│   │   └── api/                # All backend logic (serverless functions)
│   │       ├── auth/            # NextAuth + signup
│   │       ├── projects/        # CRUD + scrape trigger
│   │       │   └── [id]/
│   │       │       ├── data/     # Generated API: GET /data
│   │       │       ├── search/   # Generated API: GET /search
│   │       │       ├── schema/   # Generated API: GET /schema
│   │       │       └── docs/     # Generated API: GET /docs
│   │       ├── scrape/           # Re-scrape trigger
│   │       ├── keys/             # API key management
│   │       └── user/             # Profile + stats
│   ├── components/
│   │   ├── ui/                  # All shadcn-style components (1 file)
│   │   ├── layout/               # Theme + Query providers
│   │   ├── dashboard/            # Dashboard-specific components
│   │   └── landing/              # (inlined into page.tsx)
│   ├── lib/
│   │   ├── prisma.ts             # DB client
│   │   ├── auth.ts               # NextAuth config
│   │   ├── apiAuth.ts            # API key verification + rate limit
│   │   └── utils.ts               # Scraper engine + helpers
│   └── types/
├── vercel.json                # Deployment + CORS headers
└── .github/workflows/ci.yml   # Build verification on push
```

---

## 🧠 How Scraping Works (No Python Needed)

This app uses **Cheerio** — a Node.js library that parses HTML exactly like jQuery, running entirely inside Vercel's serverless functions. No browser, no Python, no separate backend service.

```
User submits URL
    │
    ▼
POST /api/projects (serverless function)
    │  Creates Project + ScrapeJob records
    │
    ▼
scrapeUrl() in src/lib/utils.ts
    │  Fetches HTML with fetch()
    │  Parses with Cheerio (jQuery-like)
    │  Extracts: title, description, headings,
    │  paragraphs, links, images, prices, author, date
    │
    ▼
Saves structured JSON + Markdown + Schema to Postgres
    │
    ▼
Generates 4 API endpoints automatically:
  /data    /search    /schema    /docs
```

For JavaScript-heavy sites, the same flow runs through **Firecrawl's API** instead (if you've added a key) — Firecrawl renders the page in a real browser on their servers.

---

## 🆓 Total Cost: $0/month

| Service | Free tier | What it covers |
|---------|-----------|----------------|
| **Vercel** | 100GB bandwidth/mo | Hosting + serverless functions |
| **Supabase** | 500MB DB, 2 projects | PostgreSQL database |
| **Firecrawl** (optional) | 500 credits/mo | JS-heavy site scraping |

No Redis, no Docker, no separate backend to pay for or manage.

---

## ❓ Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails: "Can't reach database" | Make sure `DATABASE_URL` and `DIRECT_URL` are both set in Vercel |
| Login redirects fail | Check `NEXTAUTH_URL` exactly matches your live Vercel URL (no trailing slash) |
| Scrape stays "SCRAPING" forever | Some sites block bots — try a different URL, or add a Firecrawl key |
| `prisma migrate deploy` fails locally | Make sure your local `.env` has the correct `DIRECT_URL` (port 5432, not 6543) |
| OAuth login fails | Double check the callback URL in GitHub/Google matches exactly: `https://your-app.vercel.app/api/auth/callback/github` |

---

## 📄 License

MIT — free for personal and commercial use.
