export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const KAKAO_REST_KEY = process.env.KAKAO_REST_KEY;
  const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;

  if (!KAKAO_REST_KEY || !KAKAO_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Kakao credentials not configured' });
  }

  try {
    const { code, redirect_uri } = req.body;

    if (!code || !redirect_uri) {
      return res.status(400).json({ error: 'Missing code or redirect_uri' });
    }

    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_REST_KEY,
        client_secret: KAKAO_CLIENT_SECRET,
        redirect_uri,
        code,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
