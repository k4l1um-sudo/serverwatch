// Netflix status summary endpoint removed.
export default function handler(req, res){
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(410).json({ error: 'disabled', message: 'Netflix summary endpoint has been removed.' });
}
