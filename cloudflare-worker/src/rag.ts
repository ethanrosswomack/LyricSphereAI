export type DocHit = {
  id: string;
  score: number;
  metadata?: Record<string, string>;
};

export async function embedText(env: any, text: string) {
  const { data } = await env.AI.run(env.EMBED_MODEL, { text });
  return data[0]; // embedding vector
}

export async function search(env: any, query: string, k = 6): Promise<DocHit[]> {
  const vector = await embedText(env, query);
  const res = await env.VECTORIZE.query(vector, { topK: k, returnMetadata: true });
  return res.matches.map((m: any) => ({ id: m.id, score: m.score, metadata: m.metadata }));
}

export async function fetchDocFromR2(env: any, key: string): Promise<string> {
  const obj = await env.R2_MEDIA.get(key);
  if (!obj) return '';
  return await obj.text();
}

export function buildPrompt(question: string, contexts: {text: string, meta: any}[]) {
  const ctx = contexts.map((c,i)=>`[${i+1}] ${c.text.substring(0,1800)}`).join("\n\n");
  return `You are Hawk Eye's autoRAG. Answer using only the provided context, with citations like [1], [2]. If unknown, say so.

Question: ${question}
\nContext:\n${ctx}`;
}
