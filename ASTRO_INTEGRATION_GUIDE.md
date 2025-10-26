# Integrating Chat Interface into Your Astro Site

## Quick Start

### 1. Install React in Your Astro Project

```bash
cd your-astro-project
npx astro add react
npm install lucide-react class-variance-authority clsx tailwind-merge
```

### 2. Copy the Chat Component Files

Copy these files from this Replit project to your Astro project:

```
your-astro-project/
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInterface.tsx    (Main component - see below)
│   │       └── types.ts             (TypeScript types)
│   └── pages/
│       └── chat.astro               (Chat page - see below)
```

### 3. Create a Chat Page in Astro

**File: `src/pages/chat.astro`**

```astro
---
import ChatInterface from '../components/chat/ChatInterface';
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Explore Hawk Eye's music through conversation" />
    <title>Hawk Eye Chat — Lyric Vault</title>
  </head>
  <body class="dark">
    <ChatInterface 
      client:load 
      workerEndpoint="https://your-worker.workers.dev/chat"
    />
  </body>
</html>
```

### 4. Configure Your Cloudflare Worker Endpoint

Replace `"https://your-worker.workers.dev/chat"` with your actual Cloudflare Worker URL.

Your Worker should already be set up based on the code you shared. Just make sure it's deployed and accessible.

### 5. Add Navigation Link

Add a link to the chat from your main site:

```astro
<!-- In your main layout or index page -->
<a href="/chat">Chat with Hawk Eye</a>
```

## Alternative: Embed Chat as a Widget

You can also add the chat as a floating widget on any page:

**File: `src/components/chat/ChatWidget.tsx`**

See the ChatWidget.tsx file below for a modal/popup version.

Then use it in any Astro page:

```astro
---
import ChatWidget from '../components/chat/ChatWidget';
---

<!-- Your page content -->
<ChatWidget client:idle />
```

## Environment Variables

If you want to keep your Worker URL private, use environment variables:

**.env**
```
PUBLIC_CHAT_WORKER_URL=https://your-worker.workers.dev/chat
```

Then use it in your Astro component:
```typescript
const workerUrl = import.meta.env.PUBLIC_CHAT_WORKER_URL;
```

## Styling

The chat interface uses Tailwind CSS with dark mode. Make sure your `tailwind.config.mjs` includes:

```javascript
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  // ... rest of config
}
```

## Testing

1. Run your Astro dev server: `npm run dev`
2. Navigate to `/chat`
3. Try asking questions about your music!

## Deployment to Cloudflare Pages

Your Astro site is already on Cloudflare Pages. After adding the chat:

```bash
npm run build
# Push to your GitHub repo
# Cloudflare Pages will auto-deploy
```

The chat will work seamlessly with your existing Cloudflare Worker for RAG queries.
