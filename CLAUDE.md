# Pinecone Gloria

Tumblr OAuth2 authentication app for the `gloria-exe` Tumblr account.

## Stack

- Node.js (Express 5)
- Tumblr API v2 with OAuth2
- Deployed at https://gloriadotexe.online

## Project Structure

- `index.js` — Entry point (mounts routes, starts server)
- `routes/auth.js` — OAuth2 auth routes (/callback, /redirect)
- `routes/api.js` — API routes (/user, /tokens, /refresh)
- `lib/tokens.js` — Token persistence (loadTokens, saveTokens, tokenStore)
- `.env` — Credentials (TUMBLR_CLIENT_ID, TUMBLR_CLIENT_SECRET, REDIRECT_URI, PORT)
- `tokens.json` — Persisted OAuth2 tokens (created at runtime)

## Routes

- `/` — Landing page
- `/callback` — Initiates OAuth2 flow, redirects to Tumblr authorization
- `/redirect` — OAuth2 redirect URI, exchanges auth code for tokens
- `/user` — Fetches authenticated user info from Tumblr API
- `/tokens` — Displays current access and refresh tokens
- `/refresh` — Refreshes the access token using the stored refresh token

## Local Development

```
yarn install
node index.js
```

Runs on `http://localhost:3001`. Set `REDIRECT_URI` in `.env` to `http://localhost:3001/redirect` for local dev.

## Deployment

Server: `ssh pinecone` -> `/var/www/gloriadotexe.online/`

```
rsync -avz --exclude node_modules --exclude tokens.json ./ pinecone:/var/www/gloriadotexe.online/
ssh pinecone "cd /var/www/gloriadotexe.online && yarn install && pm2 restart gloria"
```

Production `REDIRECT_URI` is `https://gloriadotexe.online/redirect`.

## pm2

- `pm2 logs gloria` — view logs
- `pm2 restart gloria` — restart after deploy
- `pm2 stop gloria` — stop the app
- `pm2 status` — check processes

## Tumblr API Usage

Use the access token from `/tokens` with curl:

```
curl -H "Authorization: Bearer ACCESS_TOKEN" https://api.tumblr.com/v2/user/info
```

Tokens expire (~42 min). Hit `/refresh` to get a new one.
