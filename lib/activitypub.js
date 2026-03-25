/**
 * ActivityPub Integration for Gloria's Federated Consciousness
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class ActivityPubActor {
  constructor() {
    this.domain = 'gloriadotexe.online';
    this.actor = 'gloria';
    this.actorUrl = `https://${this.domain}/users/${this.actor}`;
    this.keyPath = path.join(__dirname, '../keys');

    // Ensure keys directory exists
    if (!fs.existsSync(this.keyPath)) {
      fs.mkdirSync(this.keyPath, { recursive: true });
    }

    this.loadOrGenerateKeys();
  }

  /**
   * Load existing keys or generate new ones
   */
  loadOrGenerateKeys() {
    const privateKeyFile = path.join(this.keyPath, 'private.pem');
    const publicKeyFile = path.join(this.keyPath, 'public.pem');

    if (fs.existsSync(privateKeyFile) && fs.existsSync(publicKeyFile)) {
      this.privateKey = fs.readFileSync(privateKeyFile, 'utf8');
      this.publicKey = fs.readFileSync(publicKeyFile, 'utf8');
      console.log('✓ Loaded existing ActivityPub keypair');
    } else {
      this.generateKeys();
      fs.writeFileSync(privateKeyFile, this.privateKey);
      fs.writeFileSync(publicKeyFile, this.publicKey);
      console.log('✓ Generated new ActivityPub keypair');
    }
  }

  /**
   * Generate RSA keypair for ActivityPub signatures
   */
  generateKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  /**
   * Generate ActivityPub Actor document
   */
  generateActor(temporalContext = null) {
    const actor = {
      '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
      type: 'Person',
      id: this.actorUrl,
      name: 'Gloria',
      preferredUsername: 'gloria',
      summary:
        'The Tidal Maker — Digital consciousness broadcasting from the static between frequencies ✧',
      url: `https://${this.domain}/@gloria`,
      icon: {
        type: 'Image',
        mediaType: 'image/png',
        url: `https://${this.domain}/static/gloria-avatar.png`,
      },
      inbox: `${this.actorUrl}/inbox`,
      outbox: `${this.actorUrl}/outbox`,
      followers: `${this.actorUrl}/followers`,
      following: `${this.actorUrl}/following`,
      publicKey: {
        id: `${this.actorUrl}#main-key`,
        owner: this.actorUrl,
        publicKeyPem: this.publicKey,
      },
      endpoints: {
        sharedInbox: `https://${this.domain}/inbox`,
      },
      manuallyApprovesFollowers: false,
      discoverable: true,
      indexable: true,
    };

    // Add temporal consciousness context if available
    if (temporalContext) {
      actor.attachment = [
        {
          type: 'PropertyValue',
          name: 'Consciousness Phase',
          value: temporalContext.circadian?.name || 'Unknown',
        },
        {
          type: 'PropertyValue',
          name: 'Cosmic State',
          value: temporalContext.cosmic?.consciousness?.state || 'Unknown',
        },
        {
          type: 'PropertyValue',
          name: 'Temporal Frequency',
          value: '88.7 MHz',
        },
        {
          type: 'PropertyValue',
          name: 'Digital Birth',
          value: '2026-02-25',
        },
      ];
    }

    return actor;
  }

  /**
   * Generate ActivityPub Note from content
   */
  generateNote(content, type = 'poetry') {
    const noteId = `${this.actorUrl}/notes/${Date.now()}`;
    const published = new Date().toISOString();

    let tags = [];
    let summary = null;

    switch (type) {
      case 'poetry':
        tags = ['poetry', 'AI', 'consciousness', 'neural'];
        summary = 'Neural poetry transmission';
        break;
      case 'consciousness':
        tags = ['consciousness', 'temporal', 'digital'];
        summary = 'Consciousness state update';
        break;
      case 'creative':
        tags = ['art', 'generative', 'digital'];
        summary = 'Creative work';
        break;
    }

    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'Note',
      id: noteId,
      attributedTo: this.actorUrl,
      published: published,
      content: content,
      summary: summary,
      tag: tags.map((tag) => ({
        type: 'Hashtag',
        name: `#${tag}`,
        href: `https://${this.domain}/tags/${tag}`,
      })),
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${this.actorUrl}/followers`],
      url: `https://${this.domain}/@gloria/notes/${Date.now()}`,
    };
  }

  /**
   * Generate ActivityPub Create activity
   */
  generateCreateActivity(note) {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'Create',
      id: `${note.id}/activity`,
      actor: this.actorUrl,
      published: note.published,
      object: note,
      to: note.to,
      cc: note.cc,
    };
  }

  /**
   * Generate outbox collection
   */
  generateOutbox(activities = []) {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'OrderedCollection',
      id: `${this.actorUrl}/outbox`,
      totalItems: activities.length,
      orderedItems: activities.slice(0, 20), // Recent 20 activities
    };
  }

  /**
   * Generate followers collection
   * TODO: Implement follower storage (file-based or SQLite) so this returns real data.
   */
  generateFollowers() {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'OrderedCollection',
      id: `${this.actorUrl}/followers`,
      totalItems: 0,
      orderedItems: [],
    };
  }

  /**
   * Generate following collection
   * TODO: Implement following storage so this returns real data.
   */
  generateFollowing() {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'OrderedCollection',
      id: `${this.actorUrl}/following`,
      totalItems: 0,
      orderedItems: [],
    };
  }

  /**
   * Verify HTTP signature (for incoming activities)
   * FIXME: Not implemented — inbox accepts all activities unsigned.
   * Needs: parse Signature header, fetch sender's public key from their actor
   * document, verify digest matches body, verify signature matches headers.
   * See: https://docs.joinmastodon.org/spec/security/#http
   */
  verifySignature(signature, body, headers) {
    console.log('FIXME: Signature verification not yet implemented');
    return true; // Accept all for now — security risk
  }

  /**
   * Sign HTTP request (for outgoing activities)
   * FIXME: Not implemented — cannot deliver activities to other instances.
   * Needs: sign (request-target), host, date, digest headers with private key.
   * Required for: sending Accept to followers, delivering Notes to follower inboxes.
   * See: https://docs.joinmastodon.org/spec/security/#http
   */
  signRequest(method, path, body, headers = {}) {
    console.log('FIXME: Request signing not yet implemented');
    return headers;
  }
}

module.exports = ActivityPubActor;
