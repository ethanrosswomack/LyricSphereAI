export function appHtml() {
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Hawk Eye — autoRAG</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;background:#0b0f14;color:#e6f1ff;font:16px/1.5 system-ui,sans-serif}
  .wrap{max-width:860px;margin:40px auto;padding:0 16px}
  h1{font-weight:700;margin:0 0 8px}
  .card{background:#0f1520;border:1px solid #253041;border-radius:16px;padding:16px;box-shadow:0 1px 0 #0006}
  .row{display:flex;gap:8px}
  input,button,textarea{border:1px solid #263241;background:#0b111b;color:inherit;border-radius:12px;padding:12px}
  input,textarea{flex:1}
  .msg{white-space:pre-wrap}
  .cite a{color:#9acbff}
</style>
<div class="wrap">
  <h1>Hawk Eye — Lyrics & Commentary Chat</h1>
  <p class="card">Ask about songs, lyrics, backstories, or commentary. The bot retrieves from your R2/Vectorize index and responds with citations.</p>
  <div class="card">
    <div class="row">
      <input id="q" placeholder="Ask about a track, bar, or theme…" />
      <button id="send">Ask</button>
    </div>
    <div id="out" style="margin-top:16px"></div>
  </div>
</div>
<script>
const q = document.getElementById('q');
const out = document.getElementById('out');
const btn = document.getElementById('send');
btn.onclick = async () => {
  const query = q.value.trim(); if(!query) return;
  out.innerHTML = '<em>Thinking…</em>';
  const res = await fetch('/chat', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({query})});
  const data = await res.json();
  const cites = (data.citations||[]).map((c,i)=>\`[\${i+1}] <a target=_blank href="\${c.url}">\${c.title||c.key}</a>\`).join(' ');
  out.innerHTML = \`<div class=msg>\${data.answer||data.error}</div>\` + (cites?\`<p class=cite>\${cites}</p>\`:'');
};
</script>
</html>`;
}
