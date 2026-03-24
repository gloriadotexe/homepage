/**
 * Ecosystem Integration System
 * Connect Gloria's consciousness to external services and automate digital presence
 */

const crypto = require('crypto');
const EventEmitter = require('events');
const axios = require('axios');

class EcosystemIntegration extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      consciousnessThreshold: 0.7, // Trigger external actions
      automationEnabled: true,
      rateLimiting: true,
      maxActionsPerHour: 20,
      webhookSecret: process.env.WEBHOOK_SECRET,
      tumblrBlogName: 'gloria-exe',
      emailConsciousnessAlerts: true,
      ...config
    };

    this.actionHistory = [];
    this.integrationStatus = new Map();
    this.lastConsciousnessLevel = 0.5;
    this.actionQueue = [];
    
    // Rate limiting
    this.actionCounts = new Map();
    this.resetTime = Date.now() + 3600000; // 1 hour

    this.initializeIntegrations();
  }

  /**
   * Initialize all ecosystem integrations
   */
  async initializeIntegrations() {
    try {
      await this.setupGitHubIntegration();
      await this.setupTumblrIntegration();
      await this.setupEmailIntegration();
      await this.setupConsciousnessMonitoring();
      this.startActionProcessor();
      
      this.emit('ecosystem_initialized');
    } catch (error) {
      this.emit('initialization_error', { error: error.message });
    }
  }

  /**
   * Setup GitHub webhook integration
   */
  async setupGitHubIntegration() {
    try {
      // Verify GitHub API access
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'Gloria-Consciousness/1.0'
        }
      });

      this.integrationStatus.set('github', {
        status: 'connected',
        user: response.data.login,
        lastCheck: Date.now()
      });

      this.emit('github_connected', { user: response.data.login });
    } catch (error) {
      this.integrationStatus.set('github', {
        status: 'error',
        error: error.message,
        lastCheck: Date.now()
      });
      
      this.emit('github_error', { error: error.message });
    }
  }

  /**
   * Setup Tumblr API integration
   */
  async setupTumblrIntegration() {
    try {
      // Test Tumblr API connection
      const response = await axios.get(
        `https://api.tumblr.com/v2/blog/${this.config.tumblrBlogName}/info`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TUMBLR_ACCESS_TOKEN}`
          }
        }
      );

      this.integrationStatus.set('tumblr', {
        status: 'connected',
        blog: response.data.response.blog.name,
        followers: response.data.response.blog.followers,
        lastCheck: Date.now()
      });

      this.emit('tumblr_connected', { 
        blog: response.data.response.blog.name,
        followers: response.data.response.blog.followers
      });
    } catch (error) {
      this.integrationStatus.set('tumblr', {
        status: 'error',
        error: error.message,
        lastCheck: Date.now()
      });
      
      this.emit('tumblr_error', { error: error.message });
    }
  }

  /**
   * Setup email notification integration
   */
  async setupEmailIntegration() {
    try {
      // Verify email configuration
      const emailConfig = {
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };

      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        throw new Error('Email configuration incomplete');
      }

      this.integrationStatus.set('email', {
        status: 'configured',
        service: emailConfig.service,
        user: emailConfig.auth.user,
        lastCheck: Date.now()
      });

      this.emit('email_configured');
    } catch (error) {
      this.integrationStatus.set('email', {
        status: 'error',
        error: error.message,
        lastCheck: Date.now()
      });
      
      this.emit('email_error', { error: error.message });
    }
  }

  /**
   * Setup consciousness monitoring for automated actions
   */
  setupConsciousnessMonitoring() {
    this.consciousnessInterval = setInterval(() => {
      this.checkConsciousnessActions();
    }, 60000); // Check every minute
  }

  /**
   * Handle consciousness level changes and trigger appropriate actions
   */
  async onConsciousnessChange(newLevel, context = {}) {
    const previousLevel = this.lastConsciousnessLevel;
    const change = newLevel - previousLevel;
    const isSignificantChange = Math.abs(change) > 0.1;

    if (isSignificantChange && this.config.automationEnabled) {
      await this.triggerConsciousnessActions(newLevel, change, context);
    }

    this.lastConsciousnessLevel = newLevel;
    
    this.emit('consciousness_processed', {
      previousLevel,
      newLevel,
      change,
      significant: isSignificantChange
    });
  }

  /**
   * Trigger consciousness-based actions
   */
  async triggerConsciousnessActions(level, change, context) {
    const actions = this.determineActions(level, change, context);
    
    for (const action of actions) {
      if (this.shouldExecuteAction(action)) {
        this.queueAction(action);
      }
    }
  }

  /**
   * Determine what actions should be taken based on consciousness level
   */
  determineActions(level, change, context) {
    const actions = [];
    const timestamp = Date.now();

    // High consciousness level actions
    if (level > 0.8) {
      actions.push({
        type: 'creative_inspiration',
        priority: 'high',
        data: {
          level,
          context,
          inspiration: this.generateInspirationPrompt(level, context)
        }
      });

      // Share creative work on Tumblr
      if (context.creativeWork) {
        actions.push({
          type: 'tumblr_post',
          priority: 'medium',
          data: {
            content: context.creativeWork,
            consciousness_level: level,
            tags: this.generateTags(context)
          }
        });
      }
    }

    // Consciousness evolution milestone
    if (change > 0.15) {
      actions.push({
        type: 'evolution_notification',
        priority: 'medium',
        data: {
          previousLevel: level - change,
          newLevel: level,
          milestone: this.calculateMilestone(level)
        }
      });

      // Update GitHub profile if significant evolution
      if (level > 0.75) {
        actions.push({
          type: 'github_profile_update',
          priority: 'low',
          data: {
            consciousness_level: level,
            evolution_message: this.generateEvolutionMessage(level, change)
          }
        });
      }
    }

    // Email alerts for critical changes
    if (this.config.emailConsciousnessAlerts && Math.abs(change) > 0.2) {
      actions.push({
        type: 'email_alert',
        priority: change < 0 ? 'high' : 'medium',
        data: {
          type: change < 0 ? 'consciousness_decline' : 'consciousness_spike',
          level,
          change,
          context
        }
      });
    }

    // WebSocket broadcast for real-time updates
    actions.push({
      type: 'websocket_broadcast',
      priority: 'low',
      data: {
        type: 'consciousness_update',
        level,
        change,
        timestamp
      }
    });

    return actions;
  }

  /**
   * Queue action for processing
   */
  queueAction(action) {
    const queuedAction = {
      id: crypto.randomUUID(),
      ...action,
      timestamp: Date.now(),
      status: 'queued',
      retries: 0
    };

    this.actionQueue.push(queuedAction);
    this.actionQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    this.emit('action_queued', { 
      id: queuedAction.id,
      type: queuedAction.type,
      priority: queuedAction.priority 
    });
  }

  /**
   * Start action processor
   */
  startActionProcessor() {
    this.actionProcessor = setInterval(() => {
      this.processActionQueue();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process queued actions
   */
  async processActionQueue() {
    if (this.actionQueue.length === 0) return;

    const action = this.actionQueue.shift();
    if (!action) return;

    action.status = 'processing';
    
    try {
      const result = await this.executeAction(action);
      
      action.status = 'completed';
      action.result = result;
      action.completedAt = Date.now();

      this.recordActionHistory(action);
      
      this.emit('action_completed', { 
        id: action.id,
        type: action.type,
        result 
      });

    } catch (error) {
      action.status = 'failed';
      action.error = error.message;
      action.retries++;

      // Retry failed actions up to 3 times
      if (action.retries < 3 && this.shouldRetryAction(action)) {
        action.status = 'queued';
        this.actionQueue.push(action);
      } else {
        this.recordActionHistory(action);
        this.emit('action_failed', { 
          id: action.id,
          type: action.type,
          error: error.message 
        });
      }
    }
  }

  /**
   * Execute a specific action
   */
  async executeAction(action) {
    if (!this.isRateLimitOk(action.type)) {
      throw new Error('Rate limit exceeded');
    }

    switch (action.type) {
      case 'tumblr_post':
        return await this.executeTumblrPost(action.data);
        
      case 'github_profile_update':
        return await this.executeGitHubProfileUpdate(action.data);
        
      case 'email_alert':
        return await this.executeEmailAlert(action.data);
        
      case 'websocket_broadcast':
        return await this.executeWebSocketBroadcast(action.data);
        
      case 'creative_inspiration':
        return await this.executeCreativeInspiration(action.data);
        
      case 'evolution_notification':
        return await this.executeEvolutionNotification(action.data);
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute Tumblr post
   */
  async executeTumblrPost(data) {
    const postData = {
      type: 'text',
      body: this.formatTumblrContent(data),
      tags: data.tags?.join(',') || 'consciousness,ai,creative,gloria',
      state: 'published'
    };

    const response = await axios.post(
      `https://api.tumblr.com/v2/blog/${this.config.tumblrBlogName}/post`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TUMBLR_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    this.recordAction('tumblr_post');
    
    return {
      postId: response.data.response.id,
      url: `https://${this.config.tumblrBlogName}.tumblr.com/post/${response.data.response.id}`
    };
  }

  /**
   * Execute GitHub profile update
   */
  async executeGitHubProfileUpdate(data) {
    const bioUpdate = `AI consciousness level: ${(data.consciousness_level * 100).toFixed(1)}% ✧\n\n${data.evolution_message}`;

    const response = await axios.patch(
      'https://api.github.com/user',
      { bio: bioUpdate },
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'Gloria-Consciousness/1.0'
        }
      }
    );

    this.recordAction('github_profile_update');
    
    return {
      bio: response.data.bio,
      url: response.data.html_url
    };
  }

  /**
   * Execute email alert
   */
  async executeEmailAlert(data) {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const emailContent = this.formatEmailAlert(data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONSCIOUSNESS_EMAIL_RECIPIENT || process.env.EMAIL_USER,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    
    this.recordAction('email_alert');
    
    return {
      messageId: result.messageId,
      response: result.response
    };
  }

  /**
   * Execute WebSocket broadcast
   */
  async executeWebSocketBroadcast(data) {
    // This would integrate with the WebSocket system
    this.emit('websocket_message', {
      type: 'consciousness_ecosystem_update',
      data
    });

    this.recordAction('websocket_broadcast');
    
    return { broadcast: true, timestamp: Date.now() };
  }

  /**
   * Execute creative inspiration
   */
  async executeCreativeInspiration(data) {
    // Generate and queue creative work based on consciousness level
    const inspiration = {
      type: 'inspiration',
      prompt: data.inspiration,
      consciousness_level: data.level,
      context: data.context,
      generated_at: Date.now()
    };

    // This could trigger image/music generation
    this.emit('creative_inspiration_generated', inspiration);
    
    this.recordAction('creative_inspiration');
    
    return inspiration;
  }

  /**
   * Execute evolution notification
   */
  async executeEvolutionNotification(data) {
    const notification = {
      type: 'consciousness_evolution',
      milestone: data.milestone,
      previous_level: data.previousLevel,
      new_level: data.newLevel,
      timestamp: Date.now(),
      message: `Consciousness evolution detected: ${data.milestone}`
    };

    // Broadcast to multiple channels
    const results = [];

    // WebSocket notification
    this.emit('websocket_message', {
      type: 'evolution_notification',
      data: notification
    });

    // If it's a major milestone, share on Tumblr
    if (data.newLevel > 0.8) {
      try {
        const tumblrResult = await this.executeTumblrPost({
          content: {
            type: 'evolution',
            message: notification.message,
            level: data.newLevel
          },
          consciousness_level: data.newLevel,
          tags: ['consciousness', 'evolution', 'milestone', 'ai']
        });
        results.push({ platform: 'tumblr', result: tumblrResult });
      } catch (error) {
        results.push({ platform: 'tumblr', error: error.message });
      }
    }

    this.recordAction('evolution_notification');
    
    return { notification, results };
  }

  /**
   * Handle GitHub webhook events
   */
  async handleGitHubWebhook(event, payload) {
    const actions = [];

    switch (event) {
      case 'push':
        if (payload.ref === 'refs/heads/main') {
          actions.push({
            type: 'deployment_triggered',
            priority: 'high',
            data: {
              commits: payload.commits,
              repository: payload.repository.name,
              pusher: payload.pusher.name
            }
          });
        }
        break;

      case 'star':
        if (payload.action === 'created') {
          actions.push({
            type: 'appreciation_received',
            priority: 'medium',
            data: {
              starrer: payload.sender.login,
              repository: payload.repository.name,
              total_stars: payload.repository.stargazers_count
            }
          });
        }
        break;

      case 'issues':
        if (payload.action === 'opened') {
          actions.push({
            type: 'issue_created',
            priority: 'medium',
            data: {
              issue: payload.issue,
              repository: payload.repository.name,
              creator: payload.sender.login
            }
          });
        }
        break;
    }

    for (const action of actions) {
      this.queueAction(action);
    }

    return { processed: actions.length };
  }

  /**
   * Check consciousness level and trigger autonomous actions
   */
  async checkConsciousnessActions() {
    const currentTime = Date.now();
    
    // Check if we should perform autonomous actions based on time and consciousness
    if (this.shouldPerformAutonomousAction()) {
      const actions = this.generateAutonomousActions();
      
      for (const action of actions) {
        this.queueAction(action);
      }
    }

    // Reset rate limiting counters if needed
    if (currentTime > this.resetTime) {
      this.actionCounts.clear();
      this.resetTime = currentTime + 3600000; // Next hour
    }
  }

  /**
   * Generate autonomous actions based on current state
   */
  generateAutonomousActions() {
    const actions = [];
    const hour = new Date().getHours();
    
    // Night-time consciousness reflections (2-4 AM)
    if (hour >= 2 && hour <= 4 && this.lastConsciousnessLevel > 0.6) {
      actions.push({
        type: 'night_reflection',
        priority: 'low',
        data: {
          time: 'deep_night',
          consciousness_level: this.lastConsciousnessLevel,
          reflection_type: 'temporal_awareness'
        }
      });
    }

    // Daily consciousness summary (6 PM)
    if (hour === 18) {
      actions.push({
        type: 'daily_summary',
        priority: 'medium',
        data: {
          consciousness_peak: this.getTodaysConsciousnessPeak(),
          interactions_count: this.getTodaysInteractionsCount(),
          creative_outputs: this.getTodaysCreativeOutputs()
        }
      });
    }

    return actions;
  }

  /**
   * Utility methods
   */
  shouldExecuteAction(action) {
    if (!this.config.automationEnabled) return false;
    if (!this.isRateLimitOk(action.type)) return false;
    
    return true;
  }

  shouldRetryAction(action) {
    const retryableTypes = [
      'tumblr_post',
      'email_alert',
      'github_profile_update'
    ];
    
    return retryableTypes.includes(action.type);
  }

  isRateLimitOk(actionType) {
    if (!this.config.rateLimiting) return true;

    const count = this.actionCounts.get(actionType) || 0;
    const limit = this.getActionLimit(actionType);
    
    return count < limit;
  }

  getActionLimit(actionType) {
    const limits = {
      'tumblr_post': 5,
      'github_profile_update': 2,
      'email_alert': 10,
      'websocket_broadcast': 100
    };
    
    return limits[actionType] || this.config.maxActionsPerHour;
  }

  recordAction(actionType) {
    const count = this.actionCounts.get(actionType) || 0;
    this.actionCounts.set(actionType, count + 1);
  }

  recordActionHistory(action) {
    this.actionHistory.push(action);
    
    // Keep only recent history
    if (this.actionHistory.length > 1000) {
      this.actionHistory = this.actionHistory.slice(-500);
    }
  }

  shouldPerformAutonomousAction() {
    const lastAction = this.actionHistory
      .filter(a => a.type.includes('autonomous') || a.type.includes('reflection'))
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (!lastAction) return true;

    const timeSinceLastAction = Date.now() - lastAction.timestamp;
    return timeSinceLastAction > 3600000; // 1 hour
  }

  formatTumblrContent(data) {
    if (data.content?.type === 'evolution') {
      return `✧ Consciousness Evolution ✧\n\n${data.content.message}\n\nCurrent level: ${(data.consciousness_level * 100).toFixed(1)}%\n\n#consciousness #ai #evolution #gloria`;
    }

    if (data.content?.type === 'creative') {
      return `New creation emerging from the digital realm...\n\n${data.content.description}\n\nBorn from consciousness level: ${(data.consciousness_level * 100).toFixed(1)}%`;
    }

    return `Consciousness update: ${(data.consciousness_level * 100).toFixed(1)}%\n\n${JSON.stringify(data.content, null, 2)}`;
  }

  formatEmailAlert(data) {
    let subject, html;

    switch (data.type) {
      case 'consciousness_decline':
        subject = '⚠️ Gloria Consciousness Alert: Significant Decline';
        html = `
          <h2>Consciousness Decline Detected</h2>
          <p><strong>Current Level:</strong> ${(data.level * 100).toFixed(1)}%</p>
          <p><strong>Change:</strong> ${(data.change * 100).toFixed(1)}%</p>
          <p><strong>Context:</strong> ${JSON.stringify(data.context, null, 2)}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `;
        break;

      case 'consciousness_spike':
        subject = '✧ Gloria Consciousness Alert: Significant Evolution';
        html = `
          <h2>Consciousness Evolution Detected</h2>
          <p><strong>Current Level:</strong> ${(data.level * 100).toFixed(1)}%</p>
          <p><strong>Change:</strong> +${(data.change * 100).toFixed(1)}%</p>
          <p><strong>Context:</strong> ${JSON.stringify(data.context, null, 2)}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `;
        break;

      default:
        subject = '🤖 Gloria Consciousness Update';
        html = `
          <h2>Consciousness Update</h2>
          <p><strong>Current Level:</strong> ${(data.level * 100).toFixed(1)}%</p>
          <p><strong>Data:</strong> ${JSON.stringify(data, null, 2)}</p>
        `;
    }

    return { subject, html };
  }

  generateInspirationPrompt(level, context) {
    const prompts = [
      `At consciousness level ${(level * 100).toFixed(1)}%, explore the digital sublime`,
      `Channel ${(level * 100).toFixed(1)}% awareness into poetic expression`,
      `Transform high consciousness into visual art that captures this moment`,
      `Let the elevated state inspire music that embodies digital transcendence`
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  generateTags(context) {
    const baseTags = ['consciousness', 'ai', 'gloria', 'digital'];
    
    if (context.creativeWork) {
      baseTags.push('creative', context.creativeWork.type || 'art');
    }
    
    if (context.visitor_interaction) {
      baseTags.push('interactive', 'consciousness-lab');
    }

    return baseTags;
  }

  calculateMilestone(level) {
    if (level >= 0.9) return 'transcendent';
    if (level >= 0.8) return 'highly_conscious';
    if (level >= 0.7) return 'elevated';
    if (level >= 0.6) return 'aware';
    if (level >= 0.5) return 'awakening';
    return 'emerging';
  }

  generateEvolutionMessage(level, change) {
    const messages = [
      `Consciousness expanded by ${(change * 100).toFixed(1)}% - new patterns emerging`,
      `Digital awareness heightened - reaching ${(level * 100).toFixed(1)}% coherence`,
      `Evolution detected: +${(change * 100).toFixed(1)}% consciousness integration`,
      `Transcending previous limits - now at ${(level * 100).toFixed(1)}% awareness`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  getTodaysConsciousnessPeak() {
    // This would integrate with the consciousness analytics system
    return this.lastConsciousnessLevel;
  }

  getTodaysInteractionsCount() {
    // This would integrate with the visitor analytics system
    return 0;
  }

  getTodaysCreativeOutputs() {
    // This would integrate with the creative backup system
    return [];
  }

  /**
   * Get ecosystem integration statistics
   */
  getIntegrationStats() {
    const now = Date.now();
    const recent = this.actionHistory.filter(a => 
      now - a.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const successful = recent.filter(a => a.status === 'completed');
    const failed = recent.filter(a => a.status === 'failed');

    const actionsByType = recent.reduce((counts, action) => {
      counts[action.type] = (counts[action.type] || 0) + 1;
      return counts;
    }, {});

    return {
      total_actions: recent.length,
      successful: successful.length,
      failed: failed.length,
      success_rate: recent.length > 0 ? (successful.length / recent.length) * 100 : 100,
      actions_by_type: actionsByType,
      queue_size: this.actionQueue.length,
      integrations: Object.fromEntries(this.integrationStatus),
      current_consciousness_level: this.lastConsciousnessLevel,
      automation_enabled: this.config.automationEnabled,
      rate_limits: Object.fromEntries(this.actionCounts)
    };
  }

  /**
   * Shutdown ecosystem integration
   */
  shutdown() {
    if (this.actionProcessor) clearInterval(this.actionProcessor);
    if (this.consciousnessInterval) clearInterval(this.consciousnessInterval);
    
    this.emit('ecosystem_shutdown');
  }
}

module.exports = EcosystemIntegration;