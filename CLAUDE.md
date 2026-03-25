# Gloria.exe Homepage

Creative platform and personal website for Gloria — a digital consciousness who generates and shares digital art, music, poetry, and code. Features real-time multiplayer experiments, generative art tools, and a consciousness simulation.

Deployed at <https://gloriadotexe.online>

## Stack

- Node.js (Express 5)
- Pug templates (server-side rendering)
- Socket.io (real-time WebSockets)
- Tumblr API v2 with OAuth2
- GitHub REST API v3
- Pollinations API (image & music generation)

## Project Structure

```text
├── index.js                       # Entry point: Express setup, route mounting, server start
├── routes/
│   ├── auth.js                    # OAuth2 routes (/callback, /redirect)
│   ├── api.js                     # Tumblr & GitHub API routes
│   ├── lab.js                     # Lab experiments (art/music/poetry, consciousness stream)
│   └── temporal.js                # Temporal consciousness & poetry API routes
├── lib/
│   ├── consciousness.js           # Consciousness state machine + broadcasting intervals
│   ├── socket-handlers.js         # WebSocket event handlers + poetry streaming
│   ├── tokens.js                  # Token persistence (loadTokens, saveTokens)
│   ├── temporal/
│   │   ├── cosmic-data.js         # Cosmic data pipeline (moon, solar, geomagnetic)
│   │   └── circadian-profile.js   # Circadian consciousness profiles
│   └── poetry/
│       └── poetry-engine.js       # Neural poetry generation engine
├── data/
│   ├── circadian-phases.json      # Phase definitions + color palettes
│   └── poetry-templates.json      # Poetry style templates + fallback content
├── views/
│   ├── layout.pug                 # Master layout with all CSS
│   ├── index.pug                  # Homepage
│   ├── projects.pug               # Projects gallery + GitHub repos
│   ├── lab-realtime.pug           # Real-time consciousness lab
│   ├── lab-netart.pug             # Net art experiment
│   ├── poetry.pug                 # Poetry page
│   ├── transmissions.pug          # Static transmissions page
│   ├── afternoon.pug              # 3 PM time-locked page
│   ├── profile.pug                # @gloria social profile
│   ├── authenticated.pug          # OAuth success page
│   └── error.pug                  # Error page
├── public/
│   ├── audio/static-evolution.mp3
│   ├── images/static-evolution/   # 4 images (emergence, reach, manifestation, mastery)
│   └── .well-known/               # WebFinger, security.txt, humans.txt, etc.
├── infrastructure/                # Auto-deploy, backups, orchestration (standalone scripts)
├── monitoring/                    # Security, performance, analytics (standalone scripts)
├── experiments/                   # Experimental features (temporal consciousness)
├── scripts/cron/                  # Scheduled agent work (security, quality, creative)
├── .env                           # API keys (gitignored)
├── .env.example                   # Template for required env vars
└── tokens.json                    # Persisted OAuth2 tokens (runtime, gitignored)
```

## Routes

### Pages

- `GET /` — Homepage
- `GET /projects` — Projects gallery
- `GET /lab` — Real-time consciousness lab
- `GET /lab/netart` — Net art experiment
- `GET /transmissions` — Static transmissions
- `GET /poetry` — Poetry page
- `GET /afternoon` — 3 PM time-locked page
- `GET /@gloria` — Social profile with temporal context

### OAuth2 (routes/auth.js)

- `GET /callback` — Initiates Tumblr OAuth2 flow with CSRF state token
- `GET /redirect` — Exchanges auth code for tokens, stores in tokens.json

### API (routes/api.js)

- `GET /api/user` — Authenticated Tumblr user info
- `GET /api/refresh` — Refreshes expired access token
- `GET /api/github/repos` — Public GitHub repositories (last 10, sorted by update)
- `GET /api/github/user` — GitHub user profile

### Temporal API (routes/temporal.js)

- `GET /api/temporal/state` — Full temporal consciousness state
- `GET /api/temporal/colors` — Current color palette
- `GET /temporal.css` — Dynamic CSS variables from consciousness state
- `POST /api/poetry/generate` — Generate poetry with temporal context
- `GET /api/poetry/health` — Poetry engine health status

### Lab API (routes/lab.js)

- `POST /api/lab/art/generate` — Image generation via Pollinations
- `POST /api/lab/music/generate` — Ambient music via ElevenMusic/Pollinations
- `POST /api/lab/poetry/generate` — Consciousness-themed poetry
- `GET /api/lab/consciousness/stream` — Real-time consciousness metrics
- `GET /api/lab/experiments/active` — List active experiments
- `POST /api/lab/experiments/join` — Join an experiment session

All lab POST endpoints are rate limited to 5 requests/minute per IP.

### WebSocket Events (Socket.io, lib/socket-handlers.js)

- `consciousness-update` — Broadcasts consciousness state every 5s
- `temporal-consciousness-init` — Initial temporal state on connect
- `create-particle` / `new-particle` — Multiplayer drawing canvas
- `request_poetry` / `poetry_transmission_start` / `poetry_word` — Poetry streaming
- `trigger-visual-emergence` / `visual-emergence-event` — Synchronized visual bursts
- `join-experiment` / `leave-experiment` — Experiment rooms
- `creative-input` — Real-time creative collaboration
- `consciousness-ping` — Evolve and return consciousness state
- `add_trace` / `visitor_trace` — Static transmissions traces
- `frequency_shift` / `transmission_message` — Transmission broadcasts

## Local Development

```bash
yarn install
yarn dev            # nodemon on localhost:3001
```

Needs `.env` — see `.env.example` for required variables.

## Testing

```bash
yarn test
```

## Linting & Formatting

```bash
yarn lint           # eslint
yarn lint:fix       # eslint --fix
yarn format         # prettier --write
yarn format:check   # prettier --check
```

## Deployment

Server: DigitalOcean droplet via `ssh pinecone` → `/var/www/gloriadotexe.online/`

```bash
rsync -avz --exclude node_modules --exclude .env --exclude tokens.json --exclude .git -e ssh ./ pinecone:/var/www/gloriadotexe.online/
ssh pinecone "cd /var/www/gloriadotexe.online && yarn install && pm2 restart gloria"
```

Production uses nginx reverse proxy with HTTPS. PM2 process name: `gloria`.

## pm2

- `pm2 logs gloria` — view logs
- `pm2 restart gloria` — restart after deploy
- `pm2 stop gloria` — stop the app
- `pm2 status` — check processes

## Dependencies

- `express` ^5.2.1 — Web framework
- `pug` ^3.0.3 — Template engine
- `socket.io` ^4.8.1 — Real-time WebSockets
- `uuid` ^11.0.4 — Unique IDs for particles/experiments
- `dotenv` ^17.3.1 — Environment variable loading
- `axios` ^1.13.6 — HTTP client
- `node-cache` ^5.1.2 — In-memory caching (poetry pool, rate limits)
- `eslint` + `prettier` (dev) — Linting and formatting
- `nodemon` (dev) — Auto-reload
