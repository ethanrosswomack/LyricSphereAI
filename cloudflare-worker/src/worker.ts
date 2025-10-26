import { appHtml } from './html';
import { search, fetchDocFromR2, buildPrompt } from './rag';

export default {
  async fetch(req: Request, env: any) {
    const url = new URL(req.url);
    if (req.method === 'GET' && url.pathname === '/') {
      return new Response(appHtml(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }

    if (req.method === 'POST' && url.pathname === '/chat') {
      try {
        const { query } = await req.json();
        if (!query) return json({ error: 'No query' }, 400);

        // 1) Retrieve top docs from Vectorize
        const k = Number(env.MAX_CONTEXT_DOCS || 6);
        const hits = await search(env, query, k);

        // Expect each vector metadata to include: title, r2_key, url (public), maybe album
        const contexts: {text: string, meta: any}[] = [];
        for (const h of hits) {
          const key = h.metadata?.r2_key || '';
          const text = key ? await fetchDocFromR2(env, key) : '';
          contexts.push({ text, meta: h.metadata });
        }

        // 2) Build prompt and call model
        const prompt = buildPrompt(query, contexts);
        const completion: any = await env.AI.run(env.MODEL, {
          messages: [
            { role: 'system', content: 'You are a helpful, precise assistant for Hawk Eye\'s music library.' },
            { role: 'user', content: prompt }
          ],
          stream: false
        });

        const citations = hits.map((h, i) => ({
          key: h.metadata?.r2_key || h.id,
          title: h.metadata?.title || h.metadata?.track || `Doc ${i+1}`,
          url: h.metadata?.url || (h.metadata?.r2_key ? `https://s3.omniversalaether.app/${h.metadata.r2_key}` : undefined),
          score: h.score
        }));

        return json({ answer: completion.response || completion.result, citations });
      } catch (e: any) {
        return json({ error: e?.message || 'Unhandled error' }, 500);
      }
    }

    return new Response('Not found', { status: 404 });
  }
} satisfies ExportedHandler;

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*'
    }
  });
}
