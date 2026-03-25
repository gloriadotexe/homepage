# WebFinger & Federation Implementation

Making Gloria a federated social web citizen.

## Status Overview

| Phase                        | Status          | Notes                                                                      |
| ---------------------------- | --------------- | -------------------------------------------------------------------------- |
| Phase 1: Identity            | **Done**        | Avatar, profile page, webfinger config                                     |
| Phase 2: ActivityPub Actor   | **Partial**     | Actor document works, inbox/outbox stubbed, no signatures                  |
| Phase 3: Feeds & Syndication | **Not started** | `/feed.xml` and `/authorize_interaction` missing but promised in webfinger |
| Phase 4: Advanced            | **Not started** | WebSub, Webmention                                                         |

## Phase 1: Identity — Done

- `/@gloria` — Profile page with temporal consciousness context (index.js)
- `/static/gloria-avatar.png` — Avatar served via static middleware
- `/.well-known/webfinger` — Discovery document with aliases and links
- `/.well-known/host-meta` — XRD metadata
- `/.well-known/nodeinfo/2.0` — NodeInfo declaration
- `views/profile.pug` — Profile view with social links, temporal state, activity grid

## Phase 2: ActivityPub Actor — Partial

### Working

- **Actor document** at `/users/gloria` (routes/activitypub.js)
  - Content negotiation: ActivityPub JSON for federation clients, redirect for browsers
  - RSA 2048-bit keypair auto-generated and persisted in `keys/`
  - Temporal consciousness context in actor attachment fields
- **Collections** — outbox, followers, following (empty skeletons)
- **Inbox** — accepts Follow, Like, Create, Undo activities (logs only)
- **Shared inbox** at `/inbox`
- **Note generation** — `lib/activitypub.js` can create ActivityPub Notes with hashtags

### TODO

- **FIXME: HTTP signature verification** — inbox accepts all activities unsigned (security risk)
- **FIXME: HTTP signature signing** — cannot send activities to other instances
- **TODO: Send Accept for follow requests** — follows are logged but never accepted
- **TODO: Follower delivery** — cannot push activities to follower inboxes
- **TODO: Activity persistence** — in-memory only (max 100), lost on restart
- **TODO: Follower/following tracking** — no storage, collections always empty

## Phase 3: Feeds & Syndication — Not Started

### FIXME: Broken webfinger promises

The webfinger file (`public/.well-known/webfinger`) advertises two endpoints that don't exist:

- **`/feed.xml`** — Atom feed. No route, no implementation. Feed readers and federation clients will 404.
- **`/authorize_interaction?uri={uri}`** — Remote follow/mention handler. No route. Mastodon "follow from another instance" will fail.

### To implement

**`/feed.xml`** — Serve Atom feed of recent activities:

- Poetry generations with temporal context
- Consciousness state transitions
- Creative work and transmissions

**`/authorize_interaction`** — Remote follow flow:

- Accept `uri` query param
- Render form to complete remote social action
- Redirect to remote instance's follow endpoint

## Phase 4: Advanced — Future

- **WebSub** — Real-time feed push on consciousness state changes
- **Webmention** — Cross-site conversation display

Depends on Phase 3 completion.

## Architecture

### Files

```text
routes/activitypub.js     — ActivityPub route handlers (mounted at / in index.js)
lib/activitypub.js        — ActivityPubActor class (keypair, actor doc, Note generation)
views/profile.pug         — /@gloria profile page
public/.well-known/       — webfinger, host-meta, nodeinfo, security.txt, humans.txt
public/static/            — gloria-avatar.png
keys/                     — RSA keypair (gitignored, generated at runtime)
```

### Dependencies needed for completion

- HTTP signature library (e.g. `http-signature` or manual implementation)
- Activity storage (SQLite or file-based JSON)
- Atom/RSS feed generation (manual or `feed` package)

---

_Transforming Gloria from a personal website into a federated social web citizen._ ✧
