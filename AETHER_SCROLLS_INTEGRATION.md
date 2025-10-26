# Adding Chat to Aether Scrolls (Your Astro Site)

## Overview
This guide is specifically for integrating the Hawk Eye chat interface into your existing Aether Scrolls Astro project.

## Step-by-Step Integration

### 1. Install Dependencies

In your Astro project root (where `package.json` is):

```bash
# Add React support to Astro
npx astro add react

# Install UI dependencies
npm install lucide-react
```

### 2. File Structure

Add these files to your Astro project:

```
aether_scrolls/
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInterface.tsx    ← Copy from astro-components/
│   │       └── ChatWidget.tsx       ← Optional, for floating widget
│   └── pages/
│       └── chat.astro               ← Copy from astro-components/
├── wrangler.toml                     ← You already have this
└── package.json
```

### 3. Configure Your Worker URL

**Option A: Using Environment Variables (Recommended)**

Create/update `.env.local`:

```env
PUBLIC_CHAT_WORKER_URL=https://cf-autorag-hawkeye.YOUR-SUBDOMAIN.workers.dev/chat
```

Then in `src/pages/chat.astro`:

```astro
---
import ChatInterface from '../components/chat/ChatInterface';

const workerEndpoint = import.meta.env.PUBLIC_CHAT_WORKER_URL;
---
```

**Option B: Direct Configuration**

Just edit the URL in `chat.astro`:

```typescript
const workerEndpoint = 'https://cf-autorag-hawkeye.YOUR-SUBDOMAIN.workers.dev/chat';
```

### 4. Add Navigation

Update your main pages to link to the chat:

**Option 1: Add to existing navigation**
```astro
<!-- In src/pages/index.astro or your layout -->
<nav>
  <a href="/">Home</a>
  <a href="/01_singles/">Singles</a>
  <a href="/02_mixtape_sessions/">Mixtape Sessions</a>
  <a href="/03_phase2/">Phase II</a>
  <a href="/04_reckoning/">The Reckoning</a>
  <a href="/chat">Chat with Hawk Eye</a>  <!-- NEW -->
</nav>
```

**Option 2: Floating Chat Button (Add to any page)**
```astro
---
import ChatWidget from '../components/chat/ChatWidget';
const workerUrl = import.meta.env.PUBLIC_CHAT_WORKER_URL;
---

<html>
  <body>
    <!-- Your existing content -->
    
    <!-- Floating chat widget -->
    <ChatWidget client:idle workerEndpoint={workerUrl} />
  </body>
</html>
```

### 5. Deploy to Cloudflare Pages

Your site is already on Cloudflare Pages! After adding the chat:

```bash
# Build locally to test
npm run build

# Preview
npm run preview

# Push to GitHub
git add .
git commit -m "Add Hawk Eye chat interface"
git push origin main
```

Cloudflare Pages will automatically deploy your changes.

## Testing Your Worker Connection

Before deploying, test your Cloudflare Worker is working:

```bash
# In your terminal
curl -X POST https://YOUR-WORKER-URL.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Warning Shots about?"}'
```

You should get a response with `answer` and `citations`.

## Troubleshooting

### Worker Not Found
- Make sure your Worker is deployed: `wrangler deploy src/worker.ts`
- Check the URL matches your Worker route
- Verify CORS is enabled in your Worker (it should be based on your code)

### React Not Working
```bash
# Reinstall React integration
npm uninstall @astrojs/react
npx astro add react
```

### Styling Issues
The chat component includes its own CSS variables. If you have existing Tailwind config, the chat should adapt to your theme automatically.

## Advanced: Customize for Your Brand

### Update Colors

Edit the CSS variables in `chat.astro` to match your Aether Scrolls theme:

```css
:root {
  --primary: 280 65% 45%;        /* Your brand color */
  --background: 0 0% 100%;       /* Light mode bg */
}

.dark {
  --primary: 280 60% 55%;        /* Dark mode primary */
  --background: 240 4% 8%;       /* Dark mode bg */
}
```

### Suggested Questions

Update the questions in `ChatInterface.tsx` props or in `chat.astro`:

```astro
<ChatInterface 
  client:load 
  workerEndpoint={workerEndpoint}
  suggestedQuestions={[
    "Tell me about Warning Shots",
    "What themes appear in Phase II?",
    "Explain the wordplay in your latest tracks",
    "What's the story behind The Reckoning?"
  ]}
/>
```

## Files to Copy

From this Replit project, copy these files to your Astro project:

1. **`astro-components/ChatInterface.tsx`** → `src/components/chat/ChatInterface.tsx`
2. **`astro-components/chat.astro`** → `src/pages/chat.astro`
3. **`astro-components/ChatWidget.tsx`** → `src/components/chat/ChatWidget.tsx` (optional)

That's it! Your Aether Scrolls site will have a fully functional AI chat powered by your Cloudflare Worker and R2 vectorized lyrics.

## Questions?

The chat should work seamlessly with your existing Cloudflare Worker setup from the code you shared. The Worker expects `{ query: "..." }` and returns `{ answer: "...", citations: [...] }` which is exactly what the frontend is designed for.
