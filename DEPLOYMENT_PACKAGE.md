# 🚀 Complete Deployment Package for Aether Scrolls

This package integrates the Hawk Eye autoRAG chatbot into your Astro site.

## What's Included

1. **Cloudflare Worker** (`cloudflare-worker/`) - RAG backend with Vectorize + R2
2. **Astro Components** (`astro-components/`) - React chat UI for your Astro site  
3. **Integration Guides** - Step-by-step setup instructions

## Quick Deploy (Copy to Your Astro Repo)

### 1. Clone Your Aether Scrolls Repo

```bash
git clone https://github.com/HawkEyeTheRapper/aether_scrolls.git
cd aether_scrolls
```

### 2. Copy Files from This Replit

Copy these folders/files into your Astro repo:

```
From Replit → To aether_scrolls/
├── cloudflare-worker/           → cloudflare-worker/
├── astro-components/ChatInterface.tsx  → src/components/chat/ChatInterface.tsx
├── astro-components/ChatWidget.tsx     → src/components/chat/ChatWidget.tsx
└── astro-components/chat.astro         → src/pages/chat.astro
```

### 3. Install React in Your Astro Site

```bash
npx astro add react
npm install lucide-react
```

### 4. Deploy the Cloudflare Worker

```bash
cd cloudflare-worker
npm install
npx wrangler login
npx wrangler deploy src/worker.ts
```

Note your Worker URL (e.g., `https://cf-autorag-hawkeye.your-subdomain.workers.dev`)

### 5. Update Chat Component

Edit `src/pages/chat.astro` and set your Worker URL:

```astro
---
const workerEndpoint = 'https://cf-autorag-hawkeye.YOUR-SUBDOMAIN.workers.dev/chat';
---
```

### 6. Add Navigation Link

In your Astro layout or index page, add:

```astro
<a href="/chat">Chat with Hawk Eye</a>
```

### 7. Build & Deploy

```bash
npm run build
git add .
git commit -m "Add Hawk Eye autoRAG chat"
git push origin main
```

Your Cloudflare Pages site will auto-deploy!

## File Structure in Your Astro Repo

```
aether_scrolls/
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInterface.tsx
│   │       └── ChatWidget.tsx
│   └── pages/
│       ├── chat.astro              ← New chat page
│       └── ... (your existing pages)
├── cloudflare-worker/               ← New Worker code
│   ├── src/
│   │   ├── worker.ts
│   │   ├── rag.ts
│   │   └── html.ts
│   └── wrangler.toml
└── package.json
```

## What Each Component Does

### Cloudflare Worker (`cloudflare-worker/`)
- Serves standalone chat UI at `/`
- Provides `/chat` API endpoint
- Connects to your Vectorize index (`lyrics-index`)
- Pulls context from R2 bucket (`omniversal-s3`)
- Uses Workers AI for responses

### Astro Components (`src/components/chat/`)
- `ChatInterface.tsx` - Main chat UI (works in Astro)
- `ChatWidget.tsx` - Floating chat button (optional)

### Chat Page (`src/pages/chat.astro`)
- Dedicated `/chat` page on your Astro site
- Uses Worker as backend API
- Matches your site's design

## Configuration

### Environment Variables

Create `.env` in your Astro project:

```env
PUBLIC_CHAT_WORKER_URL=https://cf-autorag-hawkeye.YOUR-SUBDOMAIN.workers.dev/chat
```

### Customize Suggested Questions

Edit `src/pages/chat.astro`:

```astro
<ChatInterface 
  client:load 
  workerEndpoint={workerEndpoint}
  suggestedQuestions={[
    "Tell me about Warning Shots",
    "What themes appear across your albums?",
    "Explain the wordplay in Phase II"
  ]}
/>
```

## Testing

### Test Worker Locally
```bash
cd cloudflare-worker
npx wrangler dev src/worker.ts
```

### Test Astro Site Locally
```bash
cd aether_scrolls
npm run dev
```

Visit: `http://localhost:4321/chat`

## Deploy Checklist

- [ ] Cloudflare Worker deployed
- [ ] R2 bucket (`omniversal-s3`) has your lyrics
- [ ] Vectorize index (`lyrics-index`) is populated
- [ ] Chat components copied to Astro project
- [ ] React installed in Astro
- [ ] Worker URL configured in `chat.astro`
- [ ] Navigation link added
- [ ] Tested locally
- [ ] Pushed to GitHub
- [ ] Cloudflare Pages auto-deployed

## Troubleshooting

### "Worker not found"
- Check your Worker URL is correct
- Ensure Worker is deployed: `npx wrangler deploy src/worker.ts`

### "React not rendering"
- Make sure you added `client:load` to `<ChatInterface>`
- Verify React is installed: `npx astro add react`

### "No search results"
- Your Vectorize index might be empty
- Run the seed script or manually index content

## Next Steps

1. **Index your lyrics** - Use `cloudflare-worker/scripts/seed.ts` as template
2. **Customize design** - Edit CSS variables in `chat.astro`
3. **Add audio players** - Extend metadata with `audio_url`
4. **Custom domain** - Add to your Worker in Cloudflare dashboard

---

**You now have two chat interfaces:**
1. **Worker UI** - Standalone at `your-worker.workers.dev`
2. **Astro Page** - Integrated at `aetherscrolls.pages.dev/chat`

Both use the same RAG backend!
