// Serverless endpoint: scrape https://help.netflix.com/de/is-netflix-down
// Returns JSON { available: boolean, summary: string }
export default async function handler(req, res){
  const url = 'https://help.netflix.com/de/is-netflix-down';
  try{
    const upstream = await fetch(url, { headers: { 'User-Agent': 'serverwatch-scraper/1.0' } });
    const text = await upstream.text();

    // Look for the exact phrase in German
    const phrase = 'Netflix ist verfügbar';
    const found = text.includes(phrase);

    // Try to extract a short summary (meta description or first <p>)
    const meta = text.match(/<meta\s+(?:name|property)=["'](?:description|og:description)["']\s+content=["']([\s\S]*?)["'][^>]*>/i);
    let summary = meta && meta[1] ? meta[1].replace(/<[^>]+>/g,'').trim() : '';
    if(!summary){
      const p = text.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if(p && p[1]) summary = p[1].replace(/<[^>]+>/g,'').trim();
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ available: found === true, summary: summary || null, source: url });
  }catch(err){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(502).json({ available: false, error: err.message });
  }
}
// Netflix status summary endpoint removed.
export default function handler(req, res){
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(410).json({ error: 'disabled', message: 'Netflix summary endpoint has been removed.' });
}
