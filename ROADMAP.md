# Roadmap — Federation & Technical Debt

Gloria's open work, organized by area. Supersedes the earlier `IMPLEMENTATION_PLAN.md`, `TECHNICAL_DEBT_AUDIT.md`, and `WEBFINGER_IMPLEMENTATION.md`.

## WebFinger & Federation Status

| Phase                        | Status          | Notes                                                                      |
| ---------------------------- | --------------- | -------------------------------------------------------------------------- |
| Phase 1: Identity            | **Done**        | Avatar, profile page, webfinger config                                     |
| Phase 2: ActivityPub Actor   | **Partial**     | Actor document works, inbox/outbox stubbed, no signatures                  |
| Phase 3: Feeds & Syndication | **Partial**     | `/feed.xml` and `/authorize_interaction` routes exist; content TBD         |
| Phase 4: Advanced            | **Not started** | WebSub, Webmention                                                         |

### Phase 1 — Identity (done)

- `/@gloria` — profile page with temporal consciousness context
- `/static/gloria-avatar.png` — avatar via static middleware
- `/.well-known/webfinger` — discovery document with aliases and links
- `/.well-known/host-meta` — XRD metadata
- `/.well-known/nodeinfo/2.0` — NodeInfo declaration
- `views/profile.pug` — profile view with social links, temporal state, activity grid

### Phase 2 — ActivityPub Actor (working pieces)

- Actor document at `/users/gloria` (`routes/activitypub.js`)
  - Content negotiation: ActivityPub JSON for federation clients, redirect for browsers
  - RSA 2048-bit keypair auto-generated and persisted in `keys/`
  - Temporal consciousness context in actor attachment fields
- Collections — outbox, followers, following (empty skeletons)
- Inbox — accepts Follow, Like, Create, Undo activities (logs only)
- Shared inbox at `/inbox`
- Note generation — `lib/activitypub.js` can create ActivityPub Notes with hashtags

---

## Open Tasks

### High priority — security

#### ActivityPub inbox signature verification

- **File:** `routes/activitypub.js:86`
- **Issue:** No HTTP signature verification before processing activities
- **Risk:** Anyone can send fake activities to Gloria's inbox
- **Action:** Implement HTTP signature verification per ActivityPub spec (fetch remote actor keys, validate digest and signature headers)
- **Effort:** Complex — requires crypto understanding

#### ActivityPub outbound request signing

- **File:** `lib/activitypub.js:242` — new `lib/http-signatures.js`
- **Issue:** Cannot sign outbound requests to other instances
- **Risk:** Cannot federate securely; foundational blocker for Accept flow and delivery
- **Action:** Implement HTTP signature signing (header construction, digest calculation)
- **Effort:** Complex

### High priority — federation blockers

#### Federation Accept flow

- **File:** `routes/activitypub.js:154` — new `lib/activity-delivery.js`
- **Issue:** Accept activities not sent back to follower inboxes
- **Impact:** Mastodon follows show as "pending" forever
- **Depends on:** outbound request signing
- **Effort:** Medium

#### Phase 3 content improvements

- `/feed.xml` (`index.js:80`) works but has two hardcoded March-25 entries alongside one dynamic consciousness-state entry. Replace with live data: recent poetry generations, consciousness transitions, transmissions.
- `/authorize_interaction` (`index.js:152`) validates the `uri` param and renders a styled info page pointing users at `@gloria@gloriadotexe.online`. A fuller implementation would parse the incoming URI and redirect to the remote instance's follow endpoint.
- **Effort:** Medium

### Medium priority — federation completeness

#### Activity persistence

- **File:** `routes/activitypub.js:12` — new `lib/activity-store.js`
- **Issue:** Activities stored in memory (max 100), lost on restart
- **Action:** File-based JSON or SQLite storage; add archival, cleanup, querying, pagination
- **Effort:** Medium

#### Follower/following storage

- **Files:** `lib/activitypub.js:202,216` — new `lib/social-graph.js`
- **Issue:** Collections always empty, no persistence
- **Action:** Persistent tracking with add/remove management and integrity checks
- **Effort:** Medium

#### Activity delivery queue

- **File:** `routes/activitypub.js:201` — new `lib/delivery-queue.js`
- **Issue:** Activities not federated to follower inboxes
- **Impact:** Posts don't reach followers on other instances
- **Action:** Async delivery queue with retry logic and status tracking
- **Depends on:** outbound request signing, follower storage
- **Effort:** Complex

#### Keypair validation & rotation

- **Files:** `lib/env-validator.js`, `lib/activitypub.js`
- **Action:** Validate ActivityPub keypairs at startup; document rotation procedures
- **Effort:** Quick

### Medium priority — reliability

#### Temporal consciousness error handling

- **File:** `experiments/temporal-consciousness/temporal-integration.js:32`
- **Issue:** Generic catch blocks without specific error recovery
- **Action:** Add specific error handling and fallback behaviors
- **Effort:** Medium

#### WebSocket error boundaries

- **File:** `lib/socket-handlers.js`
- **Issue:** Connections may lack proper error boundaries; drops could crash consciousness streaming
- **Action:** Comprehensive error handling for all WebSocket events
- **Effort:** Medium

### Low priority — quality

- **Poetry engine rate limiting** (`lib/poetry/poetry-engine.js:147`) — adaptive rate limiting based on consciousness state. Quick.
- **Temporal data caching** (`lib/temporal/cosmic-data.js:89`) — smarter cache expiration per data type. Quick.
- **JSDoc coverage** — document exported functions across modules. Medium.
- **Test coverage** — `test/smoke.test.js` is minimal; expand to cover consciousness systems. Complex.
- **Monitoring enhancements** — `monitoring/` has basic structure; add performance metrics, alerting, dashboard. Complex.

---

## Phase 4 — Advanced (future)

- **WebSub** — real-time feed push on consciousness state changes
- **Webmention** — cross-site conversation display

Both depend on Phase 3 content being solid.

---

## Completed

- **Environment variable validation** — `lib/env-validator.js` added at startup (`index.js:4`)
- **`/feed.xml` route** — Atom feed with consciousness activities (`index.js:80`)
- **`/authorize_interaction` route** — social web interaction handler (`index.js:152`)
- **Error logging improvements** — specific error messages, graceful fallbacks for temporal consciousness failures
- **Stale `/feed.xml` + `/authorize_interaction` FIXMEs removed** from `index.js` (routes were already implemented)

---

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

### Dependencies needed

- HTTP signature library (e.g. `http-signature`) or manual implementation
- Activity storage (SQLite or file-based JSON)
- Atom/RSS feed generation (manual or `feed` package)

---

## Success criteria

### Federation working

- People can follow `@gloria@gloriadotexe.online` from Mastodon
- Follows show as "accepted" not "pending"
- Gloria can safely receive activities from other instances
- Activities persist across restarts
- Follower list survives restarts
- Activities actually reach followers on other instances

### Content integration

- Poetry auto-federates when generated
- Consciousness state changes notify followers
- Image generation federated sharing
- Temporal event notifications

---

_Transforming Gloria from a personal website into a federated social web citizen._ ✧
