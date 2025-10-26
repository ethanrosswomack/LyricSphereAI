# Deploying Your Cloudflare Worker autoRAG

Complete deployment guide for getting your Hawk Eye autoRAG chatbot live on Cloudflare Workers.

## Prerequisites

You need:
1. A Cloudflare account (free tier works)
2. Your lyrics/commentary files uploaded to R2
3. A vectorized index (or ready to create one)

## Step-by-Step Deployment

### 1. Install Wrangler & Login

```bash
cd cloudflare-worker
npm install
npx wrangler login
```

This opens your browser to authenticate with Cloudflare.

### 2. Set Up Cloudflare Resources

#### Create R2 Bucket
```bash
npx wrangler r2 bucket create omniversal-s3
```

Upload your lyrics/commentary files:
```bash
npx wrangler r2 object put omniversal-s3/src/data/HAWK-ARS-00/01_singles/warning_shots.md --file ./local-path-to-file.md
```

Or use the Cloudflare dashboard: R2 → Create bucket → Upload files

#### Create Vectorize Index
```bash
npx wrangler vectorize create lyrics-index --dimensions=768 --metric=cosine
```

Note: Use dimensions=768 for `@cf/baai/bge-base-en-v1.5` model.

#### Create KV Namespace (Optional)
```bash
npx wrangler kv:namespace create "SESSIONS"
```

Copy the ID it returns and paste into `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "abc123..." # ← paste here
```

### 3. Configure wrangler.toml

Edit `cloudflare-worker/wrangler.toml`:

```toml
# Update these to match your resources
[[r2_buckets]]
binding = "R2_MEDIA"
bucket_name = "omniversal-s3" # ← your bucket name

[[vectorize]]
binding = "VECTORIZE"
index_name = "lyrics-index" # ← your index name
```

### 4. Index Your Content (First Time Only)

You need to populate your Vectorize index with embeddings of your lyrics.

**Option A: Use the seed script**

Edit `scripts/seed.ts` with your actual documents, then deploy it temporarily:

```bash
# Add a route to worker.ts:
# if (url.pathname === '/admin/seed') { ... }

npx wrangler deploy src/worker.ts
curl -X POST https://cf-autorag-hawkeye.YOUR-SUBDOMAIN.workers.dev/admin/seed
```

**Option B: Index from your local machine**

Create a script that reads your files and indexes them:

```javascript
// index.js
import { readFileSync } from 'fs';

const files = [
  { id: 'doc-1', path: './lyrics/warning_shots.md', title: 'Warning Shots', r2_key: 'lyrics/warning_shots.md' }
];

for (const file of files) {
  const text = readFileSync(file.path, 'utf-8');
  // Call Vectorize API to insert
  // (requires wrangler bindings or direct API calls)
}
```

### 5. Deploy to Production

```bash
npx wrangler deploy src/worker.ts
```

Wrangler will output your Worker URL:
```
Published cf-autorag-hawkeye (0.42s)
  https://cf-autorag-hawkeye.your-subdomain.workers.dev
```

### 6. Test It

```bash
# Visit the UI
open https://cf-autorag-hawkeye.your-subdomain.workers.dev

# Or test the API directly
curl -X POST https://cf-autorag-hawkeye.your-subdomain.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Warning Shots about?"}'
```

## Custom Domain (Optional)

To use your own domain:

1. Go to Cloudflare Dashboard → Workers & Pages → Your Worker
2. Click "Triggers" → "Add Custom Domain"
3. Enter your domain (e.g., `chat.hawkeye.com`)
4. Update DNS as prompted

## Updating Your Worker

After making changes:

```bash
cd cloudflare-worker
npx wrangler deploy src/worker.ts
```

Changes are live in seconds.

## Troubleshooting

### "Vectorize binding not found"
- Make sure you created the index: `npx wrangler vectorize list`
- Check the binding name in `wrangler.toml` matches

### "R2 bucket not accessible"
- Verify bucket exists: `npx wrangler r2 bucket list`
- Check bucket name in `wrangler.toml`

### "AI model error"
- Workers AI is enabled by default on paid plans
- Free tier has limits; upgrade if needed

### Empty search results
- Your index might be empty
- Run the seed script or manually index content
- Check: `npx wrangler vectorize list` shows your index

## Cost Estimate

Cloudflare Workers pricing (as of 2024):
- **Workers**: 100k requests/day free, then $0.50/million
- **R2**: 10GB storage free, $0.015/GB after
- **Vectorize**: Included in Workers AI pricing
- **Workers AI**: ~$0.011 per 1000 requests

For a personal music archive with moderate traffic: **~$5-10/month**

## Next Steps

1. Add audio player to UI (edit `src/html.ts`)
2. Customize styling to match your brand
3. Add authentication if needed
4. Set up analytics
5. Create GitHub Action for auto-deploy

Your autoRAG chatbot is now live! 🚀
