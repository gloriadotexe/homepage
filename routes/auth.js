const { Router } = require('express');
const crypto = require('crypto');
const { tokenStore, saveTokens } = require('../lib/tokens');

const router = Router();

const CLIENT_ID = process.env.TUMBLR_CLIENT_ID;
const CLIENT_SECRET = process.env.TUMBLR_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const AUTHORIZE_URL = 'https://www.tumblr.com/oauth2/authorize';
const TOKEN_URL = 'https://api.tumblr.com/v2/oauth2/token';

router.get('/callback', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  tokenStore.state = state;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: 'basic write offline_access',
    state,
    redirect_uri: REDIRECT_URI,
  });

  res.redirect(`${AUTHORIZE_URL}?${params.toString()}`);
});

router.get('/redirect', async (req, res) => {
  const { code, state } = req.query;

  if (state !== tokenStore.state) {
    return res.status(403).send('State mismatch. Possible CSRF attack.');
  }

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      tokenStore.accessToken = data.access_token;
      tokenStore.refreshToken = data.refresh_token;
      tokenStore.expiresIn = data.expires_in;
      tokenStore.obtainedAt = new Date().toISOString();
      saveTokens(tokenStore);
      res.render('authenticated');
    } else {
      res.status(400).render('error', { message: JSON.stringify(data, null, 2) });
    }
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

module.exports = router;
