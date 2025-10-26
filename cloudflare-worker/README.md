# Hawk Eye autoRAG (Cloudflare Workers + Vectorize + R2)

**What you get**
- Static chat UI served from the Worker (`/`)
- `/chat` route: embed query → Vectorize search → pull context from R2 → call Workers AI → JSON response with citations

## 1) Create resources in Cloudflare
- **R2** bucket: upload your lyrics/commentary markdown/text (keep object keys stable)
- **Vectorize** index: create `lyrics-index`
- **Workers AI**: enable; we use `@cf/baai/bge-base-en-v1.5` (embeddings) + `@cf/meta/llama-3-8b-instruct` (chat)
- **KV (optional)**: create a namespace for `SESSIONS` if you want per-user convo memory later

## 2) Configure bindings
Edit `wrangler.toml` and set:
- `bucket_name` (R2)
- `index_name` (Vectorize)
- `ALLOWED_ORIGIN` (optional)

## 3) Deploy
```sh
npm i
npx wrangler login
npx wrangler deploy src/worker.ts
```

## 4) Test locally
```sh
npx wrangler dev src/worker.ts
```

## 5) Indexing (if needed)
Use `scripts/seed.ts` pattern or your existing pipeline to insert vectors. Each vector's metadata should include at least:
- `r2_key` — object key to fetch full text
- `title` and/or `track`
- optional public `url` (your R2 public host) for citations

## 6) Frontend tweaks
Edit `src/html.ts` to brand the page, add audio players, cover art, etc. You can link audio files stored in R2 using the same key or a parallel metadata field.

---

## Notes
- If you already have a vectorized index stored as files in R2 (e.g., JSON), you can write an adapter that reads those vectors and bulk-inserts them into Vectorize at startup via a temporary admin route, then remove it.
- For larger corpora, chunk content (e.g., 1–2k chars) before embedding; store `chunk_id` + `track` in metadata.
- To switch to OpenAI/Anthropic, replace the `env.AI.run` calls with `fetch` to the provider and store API keys in encrypted Vars.
