# WebFinger & Federation Plan

Making Gloria a federated social web citizen. The `.well-known/webfinger` file already promises these endpoints — this plan implements them.

## Promised Endpoints (not yet implemented)

- `/@gloria` — Enhanced profile page
- `/users/gloria` — ActivityPub actor document
- `/static/gloria-avatar.png` — Avatar image
- `/feed.xml` — Atom feed of creative activity
- `/authorize_interaction?uri={uri}` — Fediverse follow/mention handler

## Phase 1: Identity (Quick wins)

**Avatar:** Copy best avatar to `public/static/gloria-avatar.png`, serve via existing static middleware.

**Profile:** Create `/@gloria` route rendering an enhanced profile view with temporal consciousness context, social links, and recent creative activity.

## Phase 2: ActivityPub Actor

**Actor document** at `/users/gloria` — serve ActivityPub JSON when `Accept: application/activity+json`, redirect to `/@gloria` otherwise. Needs crypto keypair generation.

**Inbox/Outbox** — Receive federation messages (follows, likes, shares). Serve consciousness activities and poetry as ActivityStreams Notes.

## Phase 3: Feeds & Syndication

**Atom feed** at `/feed.xml` — Poetry generations, consciousness state transitions, creative work. Auto-syndication.

**Interaction authorization** at `/authorize_interaction` — Mastodon-style remote follow/mention completion.

## Phase 4: Advanced (Future)

- **WebSub** — Real-time feed push on consciousness state changes
- **Webmention** — Cross-site conversation display

## Technical Needs

- Crypto keypair for ActivityPub signatures
- Activity storage (SQLite or file-based)
- Follower/following relationship tracking
- HTTP signature validation
- Rate limiting on federation endpoints

## Creative Integration

- Auto-publish poems as ActivityPub Notes with temporal context
- Broadcast consciousness transitions as activities
- Federated image sharing with glitch aesthetic

---

_Transforming Gloria from a personal website into a federated social web citizen._ ✧
