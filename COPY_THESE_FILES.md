# Files to Copy to Your Aether Scrolls Repo

## Exact Copy Instructions

### Step 1: Download These Files from Replit

Download the entire `cloudflare-worker/` folder and `astro-components/` folder from this Replit.

Or use the Replit export feature to download the entire project.

### Step 2: Copy to Your Aether Scrolls Repo

```
Your aether_scrolls repo structure after copying:

aether_scrolls/
├── .astro/                        (existing)
├── .gitignore                     (existing - update it)
├── astro.config.mjs              (existing)
├── package.json                   (existing - update it)
├── public/                        (existing)
├── src/
│   ├── components/
│   │   └── chat/                  ← NEW FOLDER
│   │       ├── ChatInterface.tsx  ← COPY from astro-components/
│   │       └── ChatWidget.tsx     ← COPY from astro-components/ (optional)
│   ├── layouts/                   (existing)
│   └── pages/
│       ├── chat.astro             ← COPY from astro-components/
│       └── ... (existing pages)
├── cloudflare-worker/             ← COPY ENTIRE FOLDER
│   ├── src/
│   │   ├── worker.ts
│   │   ├── rag.ts
│   │   └── html.ts
│   ├── scripts/
│   │   └── seed.ts
│   ├── package.json
│   ├── wrangler.toml
│   └── README.md
├── .env                           ← CREATE NEW (optional)
└── README.md                      (existing - optionally update)
```

### Step 3: File-by-File Copy Guide

| From Replit | To Aether Scrolls | Action |
|-------------|-------------------|--------|
| `cloudflare-worker/` | `cloudflare-worker/` | Copy entire folder |
| `astro-components/ChatInterface.tsx` | `src/components/chat/ChatInterface.tsx` | Copy file |
| `astro-components/ChatWidget.tsx` | `src/components/chat/ChatWidget.tsx` | Copy file (optional) |
| `astro-components/chat.astro` | `src/pages/chat.astro` | Copy file |

### Step 4: Update package.json

Add these dependencies to your Astro `package.json`:

```json
{
  "dependencies": {
    "lucide-react": "^0.453.0"
  }
}
```

Then run:
```bash
npm install
```

### Step 5: Create .env (Optional)

Create `.env` in your Astro project root:

```env
PUBLIC_CHAT_WORKER_URL=https://cf-autorag-hawkeye.YOUR-SUBDOMAIN.workers.dev/chat
```

### Step 6: Update .gitignore

Add to your `.gitignore`:

```
# Cloudflare
cloudflare-worker/node_modules
cloudflare-worker/.wrangler
cloudflare-worker/.dev.vars

# Environment
.env
.env.local
```

## Quick Shell Commands

If you have both repos cloned locally:

```bash
# Assuming you're in a parent directory containing both repos

# Copy Worker folder
cp -r replit-project/cloudflare-worker aether_scrolls/

# Create chat components folder
mkdir -p aether_scrolls/src/components/chat

# Copy React components
cp replit-project/astro-components/ChatInterface.tsx aether_scrolls/src/components/chat/
cp replit-project/astro-components/ChatWidget.tsx aether_scrolls/src/components/chat/

# Copy chat page
cp replit-project/astro-components/chat.astro aether_scrolls/src/pages/

# Done!
cd aether_scrolls
```

## Verify Copy

After copying, verify these files exist:

```bash
cd aether_scrolls

# Check files exist
ls cloudflare-worker/src/worker.ts
ls src/components/chat/ChatInterface.tsx
ls src/pages/chat.astro

# If all show files, you're good!
```

## Next Steps After Copying

1. Install React: `npx astro add react`
2. Install dependencies: `npm install`
3. Deploy Worker: `cd cloudflare-worker && npm install && npx wrangler deploy src/worker.ts`
4. Update Worker URL in `src/pages/chat.astro`
5. Test locally: `npm run dev`
6. Commit and push: `git add . && git commit -m "Add chat" && git push`

---

**That's it!** All files copied and ready to integrate.
