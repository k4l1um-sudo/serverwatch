// Netflix serverless function removed. Endpoint disabled.
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(410).json({ error: 'disabled', message: 'Netflix endpoint has been removed from this deployment.' });
}
