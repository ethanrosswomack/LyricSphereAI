/**
 * Example outline (pseudo-ish).
 * Use node script with Wrangler bindings, or run indexing from a one-off worker.
 */
export default {
  async fetch(req: Request, env: any) {
    const docs = [
      { id: 'doc-1', title: 'Warning Shots — lyrics', r2_key: 'src/data/HAWK-ARS-00/01_singles/warning_shots.md', url: 'https://s3.omniversalaether.app/src/data/HAWK-ARS-00/01_singles/warning_shots.md' },
      // ... add more
    ];

    for (const d of docs) {
      const obj = await env.R2_MEDIA.get(d.r2_key);
      if (!obj) continue;
      const text = await obj.text();
      const { data } = await env.AI.run(env.EMBED_MODEL, { text });
      const vector = data[0];
      await env.VECTORIZE.insert([{ id: d.id, values: vector, metadata: d }]);
    }

    return new Response('seeded');
  }
}
