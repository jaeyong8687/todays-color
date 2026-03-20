export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const KAKAO_JS_KEY = process.env.KAKAO_JS_KEY;
  const KAKAO_REST_KEY = process.env.KAKAO_REST_KEY;

  if (!KAKAO_JS_KEY || !KAKAO_REST_KEY) {
    return res.status(500).json({ error: 'Kakao keys not configured' });
  }

  // JS key and REST key are public-facing (used in browser for SDK init + auth URL)
  // Only CLIENT_SECRET is truly secret and stays server-side
  return res.status(200).json({
    jsKey: KAKAO_JS_KEY,
    restKey: KAKAO_REST_KEY,
  });
}
