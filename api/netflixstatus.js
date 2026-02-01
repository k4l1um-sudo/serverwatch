// Vercel Serverless Function: Fetch Netflix 'is Netflix down' help page and return a short text summary
export default async function handler(req, res) {
  const url = 'https://help.netflix.com/de/is-netflix-down';
  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'serverwatch-vercel/1.0' } });
    const html = await upstream.text();

    // crude extraction: first <h1> and first meaningful <p>
    const strip = s => s ? s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const pAll = Array.from(html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)).map(m=>m[1]);
    // choose first paragraph that is not empty and not boilerplate
    let summary = '';
    for(const p of pAll){
      const t = strip(p);
      if(t && t.length>20){ summary = t; break; }
    }
    const title = strip(h1m && h1m[1] ? h1m[1] : 'Netflix Status');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ title, summary, source: url });
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(502).json({ error: 'upstream_error', message: err.message });
  }
}
