# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
    ┌───────────────┐         ┌──────────────┐
    │  Astro Site   │         │   Worker     │
    │  (Frontend)   │         │ (Standalone) │
    │               │         │              │
    │ /chat page    │         │ /  UI        │
    └───────┬───────┘         └──────┬───────┘
            │                        │
            │ POST /chat             │ Internal
            └────────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Cloudflare Worker   │
              │    (RAG Backend)     │
              │                      │
              │  1. Embed query      │
              │  2. Search Vectorize │
              │  3. Fetch from R2    │
              │  4. Call Workers AI  │
              │  5. Return answer    │
              └──────────┬───────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
  ┌──────────┐    ┌───────────┐    ┌──────────┐
  │Vectorize │    │    R2     │    │Workers AI│
  │  Index   │    │  Bucket   │    │  Models  │
  │          │    │           │    │          │
  │ lyrics-  │    │omniversal-│    │• Llama 3 │
  │  index   │    │    s3     │    │• BGE     │
  └──────────┘    └───────────┘    └──────────┘
```

## Data Flow

### User Asks Question

```
1. User types: "What is Warning Shots about?"
   
2. Frontend sends POST:
   {
     "query": "What is Warning Shots about?"
   }
   
3. Worker embeds query:
   [0.123, -0.456, 0.789, ...] ← 768-dim vector
   
4. Worker searches Vectorize:
   Returns top 6 matches with metadata:
   [
     {
       id: "warning-shots",
       score: 0.89,
       metadata: {
         r2_key: "lyrics/warning_shots.md",
         title: "Warning Shots",
         url: "https://...",
         track: "Warning Shots"
       }
     },
     ...
   ]
   
5. Worker fetches full text from R2:
   For each match, read file from bucket
   
6. Worker builds prompt:
   "Answer using only context...
    Question: What is Warning Shots about?
    Context:
    [1] Warning Shots lyrics: ..."
   
7. Worker calls Workers AI:
   Model: @cf/meta/llama-3-8b-instruct
   Returns answer
   
8. Worker formats response:
   {
     "answer": "Warning Shots is about...",
     "citations": [
       {
         "key": "lyrics/warning_shots.md",
         "title": "Warning Shots",
         "url": "https://...",
         "score": 0.89
       }
     ]
   }
   
9. Frontend displays:
   - Answer with formatting
   - Clickable citations
   - Timestamps
```

## Component Responsibilities

### Cloudflare Worker (`cloudflare-worker/src/worker.ts`)
- **Routes**: `/` (UI), `/chat` (API)
- **Functions**:
  - Serve standalone HTML UI
  - Handle chat API requests
  - Orchestrate RAG pipeline
  - Return JSON responses

### RAG Module (`cloudflare-worker/src/rag.ts`)
- **Functions**:
  - `embedText()` - Create embeddings via Workers AI
  - `search()` - Query Vectorize index
  - `fetchDocFromR2()` - Get full documents
  - `buildPrompt()` - Format context for LLM

### Astro Chat Page (`src/pages/chat.astro`)
- **Purpose**: Dedicated chat page on your site
- **Features**:
  - Server-side config (Worker URL)
  - Imports React component
  - Matches site design

### React Chat Interface (`src/components/chat/ChatInterface.tsx`)
- **Purpose**: Interactive chat UI
- **Features**:
  - Message history
  - Suggested questions
  - Citations with links
  - Loading states
  - Theme toggle
  - Auto-scroll

### Optional Widget (`src/components/chat/ChatWidget.tsx`)
- **Purpose**: Floating chat button
- **Features**:
  - Fixed position button
  - Modal overlay
  - Embeddable anywhere

## Resource Configuration

### Vectorize Index
- **Name**: `lyrics-index`
- **Dimensions**: 768 (matches BGE model)
- **Metric**: Cosine similarity
- **Data**: Song lyrics, commentary, backstories

### R2 Bucket
- **Name**: `omniversal-s3`
- **Contents**: Markdown files with lyrics/commentary
- **Access**: Private (Worker-only)
- **Structure**:
  ```
  omniversal-s3/
  ├── lyrics/
  │   ├── warning_shots.md
  │   ├── full_disclosure.md
  │   └── ...
  ├── commentary/
  │   └── ...
  └── albums/
      └── ...
  ```

### Workers AI Models
- **Embeddings**: `@cf/baai/bge-base-en-v1.5`
  - Input: Text query
  - Output: 768-dim vector
  
- **Chat**: `@cf/meta/llama-3-8b-instruct`
  - Input: System + user prompt with context
  - Output: Conversational answer

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Your Development                │
│                                         │
│  1. Code in Replit/Local               │
│  2. Test locally with wrangler dev     │
└─────────────────┬───────────────────────┘
                  │
                  │ wrangler deploy
                  ▼
┌─────────────────────────────────────────┐
│       Cloudflare Workers                │
│                                         │
│  - Auto-scaled globally               │
│  - Edge network                       │
│  - <1ms cold start                    │
└─────────────────┬───────────────────────┘
                  │
                  │ Bindings
                  ▼
┌─────────────────────────────────────────┐
│    Cloudflare Data & AI Services       │
│                                         │
│  - Vectorize (vector search)          │
│  - R2 (object storage)                │
│  - Workers AI (LLM inference)         │
│  - KV (optional session storage)      │
└─────────────────────────────────────────┘
```

## Integration Scenarios

### Scenario 1: Standalone Worker
```
User → worker.workers.dev/
     → Gets simple HTML UI
     → Chat works immediately
```

### Scenario 2: Astro Integration
```
User → aetherscrolls.pages.dev/chat
     → Loads React component
     → React fetches from worker.workers.dev/chat API
     → Beautiful branded UI
```

### Scenario 3: Hybrid
```
Main audience → aetherscrolls.pages.dev/chat (premium UI)
Testing/Debug → worker.workers.dev/ (simple UI)
API Access → worker.workers.dev/chat (JSON API)
```

## Security Model

### CORS
- Worker allows `*` origin by default
- Can restrict to your domain in production

### Authentication (Future)
- Optional: Add KV session storage
- Optional: Check auth header before RAG
- Optional: Rate limiting per user

### Data Access
- R2 bucket is private
- Only Worker can access
- Vectorize index is private
- Workers AI is secured by Cloudflare

## Performance Characteristics

### Latency
- **Vector search**: ~50-100ms
- **R2 fetch**: ~20-50ms per doc
- **LLM inference**: ~500-2000ms
- **Total**: ~1-3 seconds per query

### Scalability
- Workers: Unlimited automatic scaling
- Vectorize: Millions of vectors
- R2: Unlimited storage
- Workers AI: Shared capacity (fair use)

### Costs (Per 1000 Requests)
- Worker execution: $0.0005
- Vectorize queries: Included
- R2 reads: $0.0004
- Workers AI: ~$0.011

**Total**: ~$0.012 per 1000 queries

## Monitoring & Debugging

### Worker Logs
```bash
wrangler tail
```

### Test Endpoints
```bash
# Test Worker UI
curl https://worker.workers.dev/

# Test Chat API
curl -X POST https://worker.workers.dev/chat \
  -d '{"query":"test"}'
```

### Astro Dev Mode
```bash
npm run dev
# Check browser console for errors
```

## Upgrade Paths

### Add Audio Playback
- Store `audio_url` in vector metadata
- Extend UI to show audio player for citations

### Add User Sessions
- Use KV binding to store conversation history
- Add session ID to requests

### Multi-Index Support
- Create separate indexes for different content types
- Query multiple indexes and merge results

### Advanced RAG
- Implement re-ranking
- Add hybrid search (keyword + semantic)
- Use larger context window models

---

This architecture is production-ready, cost-effective, and scales automatically! 🚀
