import { Router } from 'express';
import axios from 'axios';

const router = Router();

const TENANT_ID = process.env.OUTLOOK_TENANT_ID || 'common';
const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:3001/api/outlook/callback';

const SCOPES = 'openid profile email Mail.Read offline_access';

// In-memory token store (single user). In production use a proper session store.
let tokenStore = null;

router.get('/auth', (_req, res) => {
  if (!CLIENT_ID) return res.status(503).json({ error: 'Outlook not configured (missing OUTLOOK_CLIENT_ID)' });

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    response_mode: 'query',
  });

  res.redirect(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params}`);
});

router.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Auth error: ${error}`);
  if (!code) return res.status(400).send('No auth code received');

  try {
    const { data } = await axios.post(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
        scope: SCOPES,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    tokenStore = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };

    res.redirect('http://localhost:5173/?outlook=connected');
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

async function getAccessToken() {
  if (!tokenStore) return null;

  if (Date.now() > tokenStore.expires_at - 60_000) {
    // Refresh the token
    const { data } = await axios.post(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: tokenStore.refresh_token,
        grant_type: 'refresh_token',
        scope: SCOPES,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    tokenStore = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || tokenStore.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };
  }

  return tokenStore.access_token;
}

router.get('/status', (_req, res) => {
  res.json({
    connected: !!tokenStore,
    configured: !!CLIENT_ID,
  });
});

router.post('/disconnect', (_req, res) => {
  tokenStore = null;
  res.json({ ok: true });
});

router.get('/messages', async (req, res) => {
  const token = await getAccessToken();
  if (!token) return res.status(401).json({ error: 'Not authenticated. Visit /api/outlook/auth to connect.' });

  const { folder = 'inbox', top = 20, filter } = req.query;

  try {
    const params = {
      $top: Math.min(Number(top), 50),
      $select: 'id,subject,from,receivedDateTime,isRead,bodyPreview,webLink',
      $orderby: 'receivedDateTime desc',
    };
    if (filter) params['$filter'] = filter;

    const { data } = await axios.get(
      `https://graph.microsoft.com/v1.0/me/mailFolders/${folder}/messages`,
      { headers: { Authorization: `Bearer ${token}` }, params }
    );

    res.json({ messages: data.value, nextLink: data['@odata.nextLink'] });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
});

export default router;
