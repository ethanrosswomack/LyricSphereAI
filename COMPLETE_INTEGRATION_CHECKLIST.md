# Complete Integration Checklist

Follow this checklist to integrate everything into your aether_scrolls Astro site.

## Phase 1: Cloudflare Setup (One-Time)

### 1.1 Install Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 1.2 Create Resources

```bash
# Create R2 bucket (if not exists)
wrangler r2 bucket list
# If omniversal-s3 doesn't exist:
wrangler r2 bucket create omniversal-s3

# Create Vectorize index (if not exists)
wrangler vectorize list
# If lyrics-index doesn't exist:
wrangler vectorize create lyrics-index --dimensions=768 --metric=cosine

# Create KV namespace (optional)
wrangler kv:namespace create "SESSIONS"
# Copy the ID it returns → update wrangler.toml
```

### 1.3 Upload Your Lyrics to R2

```bash
# Example: Upload a single file
wrangler r2 object put omniversal-s3/lyrics/warning_shots.md --file ./path/to/file.md

# Or upload entire directory
for file in ./lyrics/*.md; do
  wrangler r2 object put omniversal-s3/lyrics/$(basename $file) --file $file
done
```

## Phase 2: Deploy Worker

### 2.1 Navigate to Worker Directory
```bash
cd cloudflare-worker
npm install
```

### 2.2 Configure wrangler.toml

Make sure these match your resources:
```toml
[[r2_buckets]]
bucket_name = "omniversal-s3"  ✓

[[vectorize]]
index_name = "lyrics-index"    ✓
```

### 2.3 Deploy
```bash
npx wrangler deploy src/worker.ts
```

**Save the Worker URL** - you'll need it!
Example: `https://cf-autorag-hawkeye.your-subdomain.workers.dev`

### 2.4 Test Worker
```bash
curl -X POST https://YOUR-WORKER-URL/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

## Phase 3: Index Your Content (First Time Only)

### Option A: Manual Index Script

Create `index-lyrics.js`:

```javascript
// Run with: node index-lyrics.js

const files = [
  {
    id: 'warning-shots',
    path: './lyrics/warning_shots.md',
    title: 'Warning Shots',
    r2_key: 'lyrics/warning_shots.md',
    url: 'https://s3.omniversalaether.app/lyrics/warning_shots.md',
    track: 'Warning Shots',
    album: 'Singles'
  },
  // Add more files...
];

// Use Vectorize API or modify Worker to add /admin/seed route
```

### Option B: Use Worker Seed Route

1. Add seed route to `worker.ts` temporarily
2. Deploy Worker
3. Call `/admin/seed` endpoint
4. Remove seed route and redeploy

## Phase 4: Integrate into Astro Site

### 4.1 Clone Your Repo
```bash
git clone https://github.com/HawkEyeTheRapper/aether_scrolls.git
cd aether_scrolls
```

### 4.2 Add React Support
```bash
npx astro add react
npm install lucide-react
```

### 4.3 Copy Chat Components

From this Replit, copy:
```
astro-components/ChatInterface.tsx → src/components/chat/ChatInterface.tsx
astro-components/ChatWidget.tsx    → src/components/chat/ChatWidget.tsx
astro-components/chat.astro        → src/pages/chat.astro
```

### 4.4 Configure Worker URL

Edit `src/pages/chat.astro`:

```astro
---
import ChatInterface from '../components/chat/ChatInterface';

// Replace with your actual Worker URL
const workerEndpoint = 'https://cf-autorag-hawkeye.YOUR-SUBDOMAIN.workers.dev/chat';
---
```

Or use environment variables:

**.env**
```
PUBLIC_CHAT_WORKER_URL=https://cf-autorag-hawkeye.YOUR-SUBDOMAIN.workers.dev/chat
```

**src/pages/chat.astro**
```astro
---
const workerEndpoint = import.meta.env.PUBLIC_CHAT_WORKER_URL;
---
```

### 4.5 Add Navigation

In your main layout or pages, add link:

```astro
<nav>
  <a href="/">Home</a>
  <a href="/chat">Chat</a>  <!-- Add this -->
</nav>
```

### 4.6 Test Locally
```bash
npm run dev
```

Visit: `http://localhost:4321/chat`

## Phase 5: Deploy

### 5.1 Commit Changes
```bash
git add .
git commit -m "Add Hawk Eye autoRAG chat interface"
git push origin main
```

### 5.2 Verify Cloudflare Pages

Your site should auto-deploy at: `https://aetherscrolls.pages.dev`

Visit: `https://aetherscrolls.pages.dev/chat`

## Phase 6: Optional Enhancements

### 6.1 Custom Domain for Worker
1. Go to Cloudflare Dashboard → Workers → Your Worker
2. Click "Triggers" → "Add Custom Domain"
3. Enter: `api.yourdomain.com` or `chat.yourdomain.com`

### 6.2 Add Floating Chat Widget

In any Astro page:

```astro
---
import ChatWidget from '../components/chat/ChatWidget';
const workerUrl = import.meta.env.PUBLIC_CHAT_WORKER_URL;
---

<html>
  <body>
    <!-- Your content -->
    <ChatWidget client:idle workerEndpoint={workerUrl} />
  </body>
</html>
```

### 6.3 Customize Theme

Edit CSS variables in `src/pages/chat.astro`:

```css
:root {
  --primary: 280 65% 45%;  /* Your brand color */
}
```

## Verification Checklist

- [ ] Worker deployed and accessible
- [ ] Worker responds to test query
- [ ] R2 bucket contains lyrics
- [ ] Vectorize index populated
- [ ] React installed in Astro
- [ ] Chat components copied
- [ ] Worker URL configured
- [ ] Chat page renders locally
- [ ] Navigation link works
- [ ] Pushed to GitHub
- [ ] Cloudflare Pages deployed
- [ ] Chat works on live site

## Common Issues

### Worker: "Vectorize binding not found"
- Verify index exists: `wrangler vectorize list`
- Check `wrangler.toml` binding name matches

### Astro: "Module not found"
- Make sure files copied to correct locations
- Check import paths match

### Chat: "Network error"
- Verify Worker URL is correct
- Check CORS is enabled in Worker (it is by default)
- Test Worker endpoint with curl

### Search: "No results"
- Index might be empty
- Run seed script to populate Vectorize

## Cost Estimate

- **Workers**: ~$5/month (100k requests/day free)
- **R2**: ~$1/month (10GB free)
- **Vectorize**: Included in Workers AI
- **Workers AI**: ~$0.011 per 1000 requests

**Total: ~$5-10/month** for moderate usage

## Support

If you get stuck:
1. Check Worker logs: `wrangler tail`
2. Check Astro dev console
3. Review error messages
4. Verify all environment variables

---

**After completing this checklist, you'll have:**
- ✅ Fully functional RAG chatbot
- ✅ Integrated into your Astro site
- ✅ Deployed on Cloudflare infrastructure
- ✅ Ready for your users!
