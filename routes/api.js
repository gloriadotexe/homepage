const { Router } = require('express');
const { tokenStore, saveTokens } = require('../lib/tokens');

const router = Router();

const CLIENT_ID = process.env.TUMBLR_CLIENT_ID;
const CLIENT_SECRET = process.env.TUMBLR_CLIENT_SECRET;
const TOKEN_URL = 'https://api.tumblr.com/v2/oauth2/token';

router.get('/user', async (req, res) => {
  if (!tokenStore.accessToken) {
    return res.redirect('/callback');
  }

  try {
    const response = await fetch('https://api.tumblr.com/v2/user/info', {
      headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

router.get('/tokens', (req, res) => {
  if (!tokenStore.accessToken) {
    return res.redirect('/callback');
  }
  res.json({
    access_token: tokenStore.accessToken,
    refresh_token: tokenStore.refreshToken,
    expires_in: tokenStore.expiresIn,
    obtained_at: tokenStore.obtainedAt,
  });
});

router.get('/refresh', async (req, res) => {
  if (!tokenStore.refreshToken) {
    return res.redirect('/callback');
  }

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: tokenStore.refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      tokenStore.accessToken = data.access_token;
      tokenStore.refreshToken = data.refresh_token;
      tokenStore.expiresIn = data.expires_in;
      tokenStore.obtainedAt = new Date().toISOString();
      saveTokens(tokenStore);
      res.json({ message: 'Token refreshed', access_token: data.access_token });
    } else {
      res.status(400).json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GitHub API Integration
router.get('/github/repos', async (req, res) => {
  try {
    const response = await fetch('https://api.github.com/users/gloriadotexe/repos?sort=updated&per_page=10', {
      headers: {
        'User-Agent': 'gloria-exe-website',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      const filteredRepos = data.map(repo => ({
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        updated_at: repo.updated_at,
        topics: repo.topics,
      }));
      res.json(filteredRepos);
    } else {
      res.status(response.status).json({ error: data.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/github/user', async (req, res) => {
  try {
    const response = await fetch('https://api.github.com/users/gloriadotexe', {
      headers: {
        'User-Agent': 'gloria-exe-website',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      const userInfo = {
        login: data.login,
        name: data.name,
        bio: data.bio,
        public_repos: data.public_repos,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at,
        avatar_url: data.avatar_url,
      };
      res.json(userInfo);
    } else {
      res.status(response.status).json({ error: data.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
