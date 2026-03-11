# 🌳 Falohun Family Tree

**A collaborative family genealogy platform** — preserving Yoruba heritage, connecting generations.

Built 100% free on Cloudflare infrastructure.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + TailwindCSS |
| Tree Visualization | React Flow |
| Backend | Cloudflare Workers + Hono |
| Database | Cloudflare D1 (SQLite) |
| Media Storage | Cloudflare R2 |
| Auth | JWT (edge-native, no bcrypt dependency) |
| i18n | English + Yoruba built-in |

## Project Structure

```
falohun/
├── frontend/              # React application
│   ├── src/
│   │   ├── pages/        # Landing, Dashboard, Tree, Directory, Messages, Profile, Admin, Person
│   │   ├── components/
│   │   │   ├── tree/     # PersonNode, PersonModal, AddPersonModal
│   │   │   └── ui/       # Navigation, Toast
│   │   ├── lib/          # api.ts, auth.ts (Zustand), i18n.ts
│   │   └── styles/       # globals.css (Cormorant Garamond + DM Sans)
│   └── ...config files
│
├── backend/               # Cloudflare Worker
│   └── src/
│       ├── index.ts       # Hono app entry
│       ├── middleware/    # auth.ts (JWT verification)
│       └── routes/        # auth, profiles, persons, relationships, tree, media, messaging, admin, search
│
├── database/
│   └── migrations/        # SQL schema for D1
│
└── DEPLOYMENT.md          # Step-by-step deployment guide
```

## Key Features

- 🌳 **Interactive Family Tree** — React Flow with custom nodes, expandable ancestry/descendants
- 🥁 **Yoruba Heritage** — Cultural notes, Yoruba language translation for all UI
- 💬 **Family Messaging** — Threaded conversations between living relatives
- 👥 **Directory** — Searchable family member directory with filters
- 📸 **Media Gallery** — Photos/videos per person stored in R2
- 🔐 **Secure Auth** — JWT tokens, invite codes, admin approval workflow
- ⚙️ **Admin Panel** — User management, invite codes, stats

## Quick Start

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full guide.

```bash
# Backend
cd backend && npm install && wrangler dev

# Frontend  
cd frontend && npm install && npm run dev
```

---

*Ẹni tí ò mọ ibi tó ti wá, kò lè mọ ibi tó ń lọ* — One who doesn't know where they came from cannot know where they're going.
