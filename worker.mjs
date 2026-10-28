/* The only server-side code of projectWar: a relay for the YellowScribe code.
   Browsers cannot call yellowscribe.link directly (it sends no CORS headers), so the page posts its roster here and this
   Worker forwards it, returns the code and keeps nothing. Every other request goes to the static files. */
const YS = 'https://yellowscribe.link/makeArmyAndReturnCode?filename=roster.ros&allocationMode=allModels&modules=MatchedPlay';
const MAX = 1_500_000;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname !== '/api/yellowscribe') return env.ASSETS.fetch(req);
    if (req.method !== 'POST') return json({ err: 'POST only.' }, 405);
    if (req.headers.get('origin') !== u.origin) return json({ err: 'Not allowed from this page.' }, 403);
    if (+req.headers.get('content-length') > MAX) return json({ err: 'The list is too large.' }, 413);
    const body = await req.arrayBuffer();
    if (body.byteLength > MAX || !body.byteLength) return json({ err: 'The list is empty or too large.' }, body.byteLength ? 413 : 400);
    try {
      const r = await fetch(YS, { method: 'POST', body, headers: { 'content-type': 'application/octet-stream' }, signal: AbortSignal.timeout(25000) });
      const t = await r.text(); let j = null; try { j = JSON.parse(t) } catch { }
      if (r.ok && /^[0-9a-f]{8}$/.test(j?.code || '')) return json({ code: j.code });
      return json({ err: typeof j?.err === 'string' ? j.err.replace(/<[^>]*>/g, '').slice(0, 300) : 'YellowScribe could not read this list.' }, 502);
    } catch { return json({ err: 'YellowScribe did not answer. Try again in a moment.' }, 504) }
  },
};
