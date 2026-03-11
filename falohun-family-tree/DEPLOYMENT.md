# 🌳 Falohun Family Tree — Complete Deployment Guide

> Deploy your entire family platform 100% FREE using Cloudflare's free tier — no credit card required.

---

## Prerequisites

- Node.js 18+ installed ([nodejs.org](https://nodejs.org))
- A Cloudflare account ([cloudflare.com](https://cloudflare.com) — free, no card needed)
- Git (optional but recommended)

---

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

Verify installation:
```bash
wrangler --version
```

---

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This opens your browser. Log in with your Cloudflare account. You'll see "Successfully logged in" in the terminal.

---

## Step 3: Create the D1 Database

```bash
wrangler d1 create falohun-family-db
```

**Important:** Copy the `database_id` from the output. It looks like:
```
✅ Successfully created DB 'falohun-family-db'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

⭐️ database_id": "aafccf05-95b9-45d0-8e77-e8a11f3e2ad0"
```

Update `backend/wrangler.toml` — replace `YOUR-DATABASE-ID` with this value:
```toml
[[d1_databases]]
binding = "DB"
database_name = "falohun-family-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← Your ID here
```

---

## Step 4: Run Database Migrations

From the `backend/` directory:

```bash
cd backend

# Apply migrations (creates all tables)
wrangler d1 execute falohun-family-db --file=../database/migrations/0001_initial.sql

# Verify tables were created
wrangler d1 execute falohun-family-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

## Step 5: Create the R2 Storage Bucket

```bash
wrangler r2 bucket create falohun-family-media
```

### Enable Public Access for Media

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **R2** in the left sidebar
3. Click **falohun-family-media**
4. Go to **Settings** → **Public Access**
5. Click **Allow Access** and copy your public URL
6. It will look like: `https://pub-abc123.r2.dev`

Update `backend/wrangler.toml`:
```toml
[vars]
R2_PUBLIC_URL = "https://pub-YOUR-ID.r2.dev"  # ← Your R2 public URL
```

---

## Step 6: Set Secret Environment Variables

```bash
cd backend

# Set your JWT secret (use a long, random string)
wrangler secret put JWT_SECRET
# When prompted, paste a secure random string like:
# xK9mP2vL7nQ4rT8wY1aB6cD3eF0gH5iJ

# You can generate one with:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 7: Install Backend Dependencies & Deploy Worker

```bash
cd backend
npm install

# Deploy to Cloudflare Workers
wrangler deploy
```

You'll see output like:
```
Deployed falohun-api triggers (1.25 sec)
  https://falohun-api.YOUR-SUBDOMAIN.workers.dev
```

**Copy this URL** — you'll need it for the frontend.

---

## Step 8: Configure Frontend Environment

Create `frontend/.env.production`:
```env
VITE_API_URL=https://falohun-api.YOUR-SUBDOMAIN.workers.dev
```

And `frontend/.env.development` (for local testing):
```env
VITE_API_URL=http://localhost:8787
```

---

## Step 9: Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a `dist/` folder with your production-ready frontend.

---

## Step 10: Deploy Frontend to Cloudflare Pages

### Option A: Deploy via CLI (easiest)

```bash
cd frontend
npx wrangler pages deploy dist --project-name falohun-family
```

On first run, it will create the project and deploy. Subsequent deployments use the same command.

Your site will be live at: `https://falohun-family.pages.dev`

### Option B: Deploy via Git (recommended for ongoing updates)

1. Push your project to GitHub
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com) → **Pages**
3. Click **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Framework preset:** Vite
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Build output directory:** `frontend/dist`
6. Add environment variable:
   - `VITE_API_URL` = `https://falohun-api.YOUR-SUBDOMAIN.workers.dev`
7. Click **Save and Deploy**

---

## Step 11: Update CORS for Production

Update `backend/wrangler.toml`:
```toml
[vars]
FRONTEND_URL = "https://falohun-family.pages.dev"
```

Redeploy the worker:
```bash
cd backend
wrangler deploy
```

---

## Step 12: Set Up Your Admin Account

1. Visit `https://falohun-family.pages.dev`
2. Click **Join Family**
3. Register with your email (no invite code needed — this first account goes through admin approval)
4. Approve yourself via D1:

```bash
wrangler d1 execute falohun-family-db --command="UPDATE Users SET isApproved=1, role='admin' WHERE email='your@email.com';"
```

5. Log in and you're ready!

---

## Custom Domain (Optional — Free)

1. In Cloudflare Dashboard → **Pages** → your project
2. Click **Custom domains** → **Set up a custom domain**
3. Enter `falohun.family` (or your domain)
4. Follow DNS setup instructions

---

## Local Development

To run the full stack locally:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
wrangler dev --local
# API available at http://localhost:8787
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## Environment Variables Summary

| Variable | Where | Description |
|----------|-------|-------------|
| `JWT_SECRET` | Worker Secret | Long random string for JWT signing |
| `FRONTEND_URL` | wrangler.toml vars | Your Pages URL for CORS |
| `R2_PUBLIC_URL` | wrangler.toml vars | Public R2 bucket URL for media |
| `VITE_API_URL` | Frontend .env | Your Worker API URL |

---

## Free Tier Limits (Cloudflare)

| Service | Free Limit | Falohun Usage |
|---------|-----------|---------------|
| Workers | 100,000 req/day | More than enough |
| D1 | 5M rows, 5GB | Years of family data |
| R2 | 10GB storage | Hundreds of photos |
| Pages | Unlimited deploys | ✅ |

---

## Troubleshooting

**"Authentication required" errors:**
- Check `JWT_SECRET` was set with `wrangler secret put JWT_SECRET`
- Verify the CORS origin matches your frontend URL

**Database errors:**
- Re-run migrations: `wrangler d1 execute falohun-family-db --file=../database/migrations/0001_initial.sql`

**Media uploads failing:**
- Verify R2 bucket name matches in `wrangler.toml`
- Check public access is enabled for the bucket

**CORS errors:**
- Update `FRONTEND_URL` in `wrangler.toml` to match your deployed frontend URL
- Redeploy worker after changes

---

## Yoruba Blessing 🌿

> *Igi tí kò ní ìdí kò ní dúró — A tree without roots cannot stand*
> 
> May the Falohun family tree stand tall across all generations. 🌳

