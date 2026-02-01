// Vercel Serverless Function: Fetch Netflix status and return JSON with CORS
export default async function handler(req, res) {
  const url = 'https://netflix.statuspage.io/api/v2/summary.json';
  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'serverwatch-vercel/1.0' } });
    const ctype = (upstream.headers.get('content-type') || '').toLowerCase();
    const text = await upstream.text();

    // If upstream returned JSON content-type or the body looks like JSON, parse it.
    let payload = null;
    if(ctype.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')){
      try{
        payload = JSON.parse(text);
      }catch(e){
        // return a helpful error containing a snippet of the raw response
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(502).json({ error: 'invalid_upstream_json', message: 'Upstream returned non-JSON or malformed JSON', snippet: text.slice(0,1000) });
        return;
      }
    } else {
      // upstream did not return JSON (HTML or redirect); return body as text for debugging
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(502).json({ error: 'upstream_not_json', message: 'Upstream did not return JSON', snippet: text.slice(0,1000), contentType: ctype });
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(upstream.status || 200).json(payload);
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(502).json({ error: 'upstream_error', message: err.message });
  }
}
