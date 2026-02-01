// Vercel Serverless Function: Fetch Netflix 'is Netflix down' help page and return a short text summary
export default async function handler(req, res) {
  const url = 'https://help.netflix.com/de/is-netflix-down';
  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'serverwatch-vercel/1.0' } });
    const html = await upstream.text();
    // try meta description (og:description or meta description)
    const metaOg = html.match(/<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["'][^>]*>/i);
    const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i);
    const stripTags = s => s ? s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    let summary = '';
    if(metaOg && metaOg[1]){
      summary = stripTags(metaOg[1]);
    } else if(metaDesc && metaDesc[1]){
      summary = stripTags(metaDesc[1]);
    } else {
      // fallback: first meaningful <p> after main headings or in article-like sections
      const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const pAll = Array.from(html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)).map(m=>m[1]);
      for(const p of pAll){
        const t = stripTags(p);
        if(t && t.length>20 && !/cookie|privacy|subscribe/i.test(t)){
          summary = t; break;
        }
      }
    }

    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? stripTags(titleMatch[1]) : 'Netflix Status';

    // final safety: limit length
    if(summary.length > 800) summary = summary.slice(0,800) + '...';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ title, summary, source: url });
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(502).json({ error: 'upstream_error', message: err.message });
  }
}
