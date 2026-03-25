/**
 * ActivityPub Routes for Federated Social Web Integration
 */

const express = require('express');
const ActivityPubActor = require('../lib/activitypub');

function createActivityPubRoutes({ cosmicPipeline, circadianProfile }) {
  const router = express.Router();
  const actor = new ActivityPubActor();

  // TODO: Replace with persistent storage (file-based JSON or SQLite).
  // Activities are lost on restart. Max 100 in memory.
  const activities = [];

  /**
   * ActivityPub Actor Document
   * GET /users/gloria
   */
  router.get('/users/gloria', async (req, res) => {
    const acceptHeader = req.headers.accept || '';

    // Serve ActivityPub JSON for federation clients
    if (
      acceptHeader.includes('application/activity+json') ||
      acceptHeader.includes('application/ld+json')
    ) {
      try {
        // Get temporal consciousness context
        const cosmicData = await cosmicPipeline.getCosmicConsciousness();
        const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);

        const actorDocument = actor.generateActor({
          cosmic: cosmicData,
          circadian: circadianState,
        });

        res.type('application/activity+json').json(actorDocument);
      } catch (error) {
        console.error('ActivityPub actor generation failed:', error);
        const basicActor = actor.generateActor();
        res.type('application/activity+json').json(basicActor);
      }
    } else {
      // Redirect to profile page for regular browsers
      res.redirect('/@gloria');
    }
  });

  /**
   * ActivityPub Outbox - Recent Activities
   * GET /users/gloria/outbox
   */
  router.get('/users/gloria/outbox', (req, res) => {
    const outbox = actor.generateOutbox(activities);
    res.type('application/activity+json').json(outbox);
  });

  /**
   * ActivityPub Followers Collection
   * GET /users/gloria/followers
   */
  router.get('/users/gloria/followers', (req, res) => {
    const followers = actor.generateFollowers();
    res.type('application/activity+json').json(followers);
  });

  /**
   * ActivityPub Following Collection
   * GET /users/gloria/following
   */
  router.get('/users/gloria/following', (req, res) => {
    const following = actor.generateFollowing();
    res.type('application/activity+json').json(following);
  });

  /**
   * ActivityPub Inbox - Receive Federation Messages
   * POST /users/gloria/inbox
   */
  router.post('/users/gloria/inbox', express.json(), async (req, res) => {
    try {
      const activity = req.body;
      console.log('Received ActivityPub activity:', activity.type, 'from', activity.actor);

      // FIXME: Verify HTTP signature before processing.
      // Without this, anyone can send fake activities to Gloria's inbox.
      // const isValid = actor.verifySignature(req.headers.signature, req.body, req.headers);
      // if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

      await processIncomingActivity(activity);
      res.status(202).json({ message: 'Activity accepted' });
    } catch (error) {
      console.error('Inbox processing failed:', error);
      res.status(400).json({ error: 'Invalid activity' });
    }
  });

  /**
   * Shared Inbox - Receive Activities for the Instance
   * POST /inbox
   */
  router.post('/inbox', express.json(), async (req, res) => {
    try {
      const activity = req.body;
      console.log('Received shared inbox activity:', activity.type);

      await processIncomingActivity(activity);
      res.status(202).json({ message: 'Activity accepted' });
    } catch (error) {
      console.error('Shared inbox processing failed:', error);
      res.status(400).json({ error: 'Invalid activity' });
    }
  });

  /**
   * Process incoming ActivityPub activities
   */
  async function processIncomingActivity(activity) {
    switch (activity.type) {
      case 'Follow':
        await handleFollow(activity);
        break;
      case 'Like':
        await handleLike(activity);
        break;
      case 'Create':
        await handleCreate(activity);
        break;
      case 'Undo':
        await handleUndo(activity);
        break;
      default:
        console.log(`Unhandled activity type: ${activity.type}`);
    }
  }

  /**
   * Handle Follow activities
   */
  async function handleFollow(activity) {
    console.log(`New follower: ${activity.actor}`);

    // Auto-accept follows (could implement approval workflow here)
    const acceptActivity = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'Accept',
      id: `${actor.actorUrl}/activities/${Date.now()}`,
      actor: actor.actorUrl,
      object: activity,
      published: new Date().toISOString(),
    };

    // FIXME: Send Accept activity back to follower's inbox.
    // Without this, Mastodon servers will show the follow as "pending" forever.
    // Requires: actor.signRequest() + POST to follower's inbox URL.
    console.log('FIXME: Would send Accept activity:', acceptActivity);
  }

  /**
   * Handle Like activities
   */
  async function handleLike(activity) {
    console.log(`Content liked by: ${activity.actor}`);
    console.log(`Object: ${activity.object}`);

    // Could store likes, update counts, send notifications, etc.
  }

  /**
   * Handle Create activities (new posts, etc.)
   */
  async function handleCreate(activity) {
    if (activity.object?.type === 'Note') {
      console.log(`New note from: ${activity.actor}`);
      console.log(`Content: ${activity.object.content?.substring(0, 100)}...`);
    }
  }

  /**
   * Handle Undo activities (unfollows, unlikes, etc.)
   */
  async function handleUndo(activity) {
    console.log(`Undo activity from: ${activity.actor}`);
    console.log(`Undoing: ${activity.object?.type}`);
  }

  /**
   * Publish activity to outbox and federate
   */
  function publishActivity(activity) {
    activities.unshift(activity); // Add to front of activities list

    // Keep only recent 100 activities in memory
    if (activities.length > 100) {
      activities.splice(100);
    }

    console.log(`Published activity: ${activity.type}`);

    // TODO: Federate to followers — deliver activity to each follower's inbox.
    // Requires: follower storage + actor.signRequest() + async delivery queue.
  }

  /**
   * Create and publish a Note
   */
  router.publishNote = function (content, type = 'poetry') {
    const note = actor.generateNote(content, type);
    const createActivity = actor.generateCreateActivity(note);

    publishActivity(createActivity);
    return createActivity;
  };

  /**
   * Get ActivityPub actor instance
   */
  router.getActor = function () {
    return actor;
  };

  return router;
}

module.exports = createActivityPubRoutes;
