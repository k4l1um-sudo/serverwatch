// Vercel Serverless Function: Fetch Netflix status and return JSON with CORS
export default async function handler(req, res) {
  const url = 'https://netflix.statuspage.io/api/v2/summary.json';
  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'serverwatch-vercel/1.0' } });
    const json = await upstream.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(upstream.status || 200).json(json);
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(502).json({ error: 'upstream_error', message: err.message });
  }
}
