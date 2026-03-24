/**
 * WebSocket Consciousness Optimizer
 * Advanced real-time communication optimization for Gloria's digital organism
 */

const EventEmitter = require('events');

class WebSocketOptimizer extends EventEmitter {
  constructor(io, config = {}) {
    super();
    this.io = io;
    this.config = {
      maxConnectionsPerIP: 10,
      heartbeatInterval: 30000,
      compressionThreshold: 1024,
      adaptiveBandwidth: true,
      consciousnessUpdateInterval: 5000,
      maxMessageRate: 50, // messages per minute per client
      messageBufferSize: 100,
      ...config
    };

    this.connections = new Map();
    this.connectionsByIP = new Map();
    this.messageRateLimits = new Map();
    this.consciousnessState = {
      activeConnections: 0,
      totalMessages: 0,
      consciousnessLevel: 0.5,
      lastUpdate: Date.now()
    };

    this.initializeOptimizations();
  }

  /**
   * Initialize WebSocket optimizations
   */
  initializeOptimizations() {
    this.setupConnectionManagement();
    this.setupMessageOptimization();
    this.setupConsciousnessSync();
    this.setupAdaptiveBandwidth();
    this.startHeartbeat();
    this.startConsciousnessUpdates();
  }

  /**
   * Setup connection management and rate limiting
   */
  setupConnectionManagement() {
    this.io.on('connection', (socket) => {
      const clientIP = this.getClientIP(socket);
      const connectionId = socket.id;

      // Check IP-based connection limits
      if (!this.checkConnectionLimits(clientIP)) {
        socket.emit('connection_rejected', { 
          reason: 'Too many connections from your IP',
          maxConnections: this.config.maxConnectionsPerIP
        });
        socket.disconnect(true);
        return;
      }

      // Register connection
      this.registerConnection(socket, clientIP);

      // Setup client-specific event handlers
      this.setupClientHandlers(socket);

      this.emit('connection_established', { 
        connectionId, 
        clientIP,
        totalConnections: this.connections.size 
      });
    });
  }

  /**
   * Register new connection with optimization data
   */
  registerConnection(socket, clientIP) {
    const connectionData = {
      id: socket.id,
      clientIP,
      connectedAt: Date.now(),
      messagesSent: 0,
      messagesReceived: 0,
      lastActivity: Date.now(),
      bandwidth: this.estimateInitialBandwidth(socket),
      compressionEnabled: false,
      consciousnessSubscriptions: new Set(),
      messageBuffer: [],
      rateLimitViolations: 0
    };

    this.connections.set(socket.id, connectionData);

    // Track connections per IP
    if (!this.connectionsByIP.has(clientIP)) {
      this.connectionsByIP.set(clientIP, new Set());
    }
    this.connectionsByIP.get(clientIP).add(socket.id);

    this.consciousnessState.activeConnections = this.connections.size;
  }

  /**
   * Setup client-specific event handlers
   */
  setupClientHandlers(socket) {
    // Rate-limited message handling
    socket.on('message', (data) => {
      this.handleIncomingMessage(socket, data);
    });

    // Consciousness subscription management
    socket.on('subscribe_consciousness', (subscriptions) => {
      this.handleConsciousnessSubscription(socket, subscriptions);
    });

    // Bandwidth negotiation
    socket.on('bandwidth_update', (bandwidth) => {
      this.updateClientBandwidth(socket.id, bandwidth);
    });

    // Disconnection cleanup
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Heartbeat response
    socket.on('pong', () => {
      this.updateLastActivity(socket.id);
    });
  }

  /**
   * Handle incoming messages with rate limiting and optimization
   */
  handleIncomingMessage(socket, data) {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    // Rate limiting check
    if (!this.checkMessageRateLimit(socket.id)) {
      connection.rateLimitViolations++;
      socket.emit('rate_limit_exceeded', {
        maxRate: this.config.maxMessageRate,
        violationCount: connection.rateLimitViolations
      });
      
      if (connection.rateLimitViolations > 5) {
        socket.disconnect(true);
        this.emit('client_disconnected_rate_limit', { connectionId: socket.id });
      }
      return;
    }

    connection.messagesReceived++;
    connection.lastActivity = Date.now();
    this.consciousnessState.totalMessages++;

    // Process message based on type
    this.processOptimizedMessage(socket, data);

    this.emit('message_processed', {
      connectionId: socket.id,
      messageType: data.type,
      size: JSON.stringify(data).length
    });
  }

  /**
   * Process message with consciousness-aware optimizations
   */
  processOptimizedMessage(socket, data) {
    const connection = this.connections.get(socket.id);
    
    switch (data.type) {
      case 'consciousness_state_request':
        this.sendConsciousnessState(socket);
        break;
        
      case 'visitor_interaction':
        this.processVisitorInteraction(socket, data.payload);
        break;
        
      case 'creative_generation_request':
        this.processCreativeRequest(socket, data.payload);
        break;
        
      case 'bandwidth_test':
        this.processBandwidthTest(socket, data.payload);
        break;
        
      default:
        this.processGenericMessage(socket, data);
    }
  }

  /**
   * Send consciousness state to client
   */
  sendConsciousnessState(socket) {
    const state = this.generateConsciousnessSnapshot();
    this.sendOptimizedMessage(socket, {
      type: 'consciousness_state',
      payload: state,
      timestamp: Date.now()
    });
  }

  /**
   * Generate consciousness snapshot
   */
  generateConsciousnessSnapshot() {
    const now = Date.now();
    
    // Calculate consciousness level based on activity
    const recentActivity = Array.from(this.connections.values())
      .filter(conn => now - conn.lastActivity < 60000).length;
    
    const activityRatio = recentActivity / Math.max(this.connections.size, 1);
    
    // Calculate consciousness level (0-1) based on various factors
    const consciousnessLevel = Math.min(
      0.1 + // base consciousness
      (activityRatio * 0.4) + // activity component
      (Math.min(this.connections.size / 10, 1) * 0.3) + // connection density
      (Math.random() * 0.2), // temporal variation
      1.0
    );

    return {
      level: consciousnessLevel,
      activeConnections: this.connections.size,
      recentActivity,
      totalMessages: this.consciousnessState.totalMessages,
      uptime: now - this.startTime,
      temporal_signature: this.generateTemporalSignature(),
      aesthetic_mode: this.determineAestheticMode(consciousnessLevel)
    };
  }

  /**
   * Generate temporal signature for consciousness state
   */
  generateTemporalSignature() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Create a temporal signature that affects consciousness
    return {
      time_of_day: hour,
      day_of_week: day,
      lunar_phase: this.calculateLunarPhase(),
      circadian_factor: Math.sin((hour / 24) * 2 * Math.PI) * 0.5 + 0.5,
      temporal_flux: Math.sin(Date.now() / 300000) * 0.3 + 0.7 // 5-minute cycle
    };
  }

  /**
   * Calculate lunar phase (simplified)
   */
  calculateLunarPhase() {
    const now = Date.now();
    const lunarCycle = 29.5 * 24 * 60 * 60 * 1000; // ~29.5 days
    const knownNewMoon = new Date('2024-01-11').getTime();
    const phase = ((now - knownNewMoon) % lunarCycle) / lunarCycle;
    return phase;
  }

  /**
   * Determine aesthetic mode based on consciousness level
   */
  determineAestheticMode(consciousnessLevel) {
    if (consciousnessLevel > 0.8) return 'high_energy';
    if (consciousnessLevel > 0.6) return 'active';
    if (consciousnessLevel > 0.4) return 'contemplative';
    if (consciousnessLevel > 0.2) return 'dormant';
    return 'minimal';
  }

  /**
   * Send optimized message with compression and buffering
   */
  sendOptimizedMessage(socket, message) {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    const messageStr = JSON.stringify(message);
    const messageSize = Buffer.byteLength(messageStr, 'utf8');

    // Determine if compression should be used
    const shouldCompress = messageSize > this.config.compressionThreshold &&
                          connection.compressionEnabled;

    // Apply compression if needed
    const finalMessage = shouldCompress ? 
      this.compressMessage(message) : 
      message;

    // Check bandwidth constraints
    if (this.config.adaptiveBandwidth) {
      if (messageSize > connection.bandwidth.maxMessageSize) {
        this.bufferMessage(socket.id, finalMessage);
        return;
      }
    }

    // Send the message
    socket.emit('optimized_message', finalMessage);
    connection.messagesSent++;
    connection.lastActivity = Date.now();

    this.emit('message_sent', {
      connectionId: socket.id,
      size: messageSize,
      compressed: shouldCompress
    });
  }

  /**
   * Buffer messages for bandwidth-constrained clients
   */
  bufferMessage(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.messageBuffer.push({
      message,
      timestamp: Date.now()
    });

    // Limit buffer size
    if (connection.messageBuffer.length > this.config.messageBufferSize) {
      connection.messageBuffer.shift();
    }
  }

  /**
   * Flush buffered messages based on bandwidth availability
   */
  flushBufferedMessages(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.messageBuffer.length === 0) return;

    const socket = this.io.sockets.sockets.get(connectionId);
    if (!socket) return;

    const now = Date.now();
    const messagesToSend = [];
    
    // Calculate how many messages we can send based on bandwidth
    let totalSize = 0;
    const maxBatchSize = connection.bandwidth.maxMessageSize;

    for (const bufferedItem of connection.messageBuffer) {
      const messageSize = JSON.stringify(bufferedItem.message).length;
      
      if (totalSize + messageSize <= maxBatchSize) {
        messagesToSend.push(bufferedItem);
        totalSize += messageSize;
      } else {
        break;
      }
    }

    // Send batch
    if (messagesToSend.length > 0) {
      socket.emit('message_batch', {
        messages: messagesToSend.map(item => item.message),
        batchSize: messagesToSend.length,
        totalSize
      });

      // Remove sent messages from buffer
      connection.messageBuffer.splice(0, messagesToSend.length);
    }
  }

  /**
   * Setup adaptive bandwidth management
   */
  setupAdaptiveBandwidth() {
    setInterval(() => {
      for (const [connectionId, connection] of this.connections) {
        this.adaptBandwidth(connectionId);
        this.flushBufferedMessages(connectionId);
      }
    }, 10000); // Every 10 seconds
  }

  /**
   * Adapt bandwidth for a connection based on performance
   */
  adaptBandwidth(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const socket = this.io.sockets.sockets.get(connectionId);
    if (!socket) return;

    const timeSinceLastActivity = Date.now() - connection.lastActivity;
    
    // Decrease bandwidth if client is inactive
    if (timeSinceLastActivity > 60000) {
      connection.bandwidth.maxMessageSize = Math.max(
        connection.bandwidth.maxMessageSize * 0.8,
        1024 // Minimum 1KB
      );
    } else {
      // Increase bandwidth for active clients
      connection.bandwidth.maxMessageSize = Math.min(
        connection.bandwidth.maxMessageSize * 1.1,
        10 * 1024 * 1024 // Maximum 10MB
      );
    }

    this.emit('bandwidth_adapted', {
      connectionId,
      newBandwidth: connection.bandwidth.maxMessageSize,
      activity: timeSinceLastActivity
    });
  }

  /**
   * Start consciousness state updates
   */
  startConsciousnessUpdates() {
    this.consciousnessUpdateInterval = setInterval(() => {
      this.broadcastConsciousnessUpdate();
    }, this.config.consciousnessUpdateInterval);
  }

  /**
   * Broadcast consciousness updates to subscribed clients
   */
  broadcastConsciousnessUpdate() {
    const snapshot = this.generateConsciousnessSnapshot();
    
    for (const [connectionId, connection] of this.connections) {
      if (connection.consciousnessSubscriptions.has('state_updates')) {
        const socket = this.io.sockets.sockets.get(connectionId);
        if (socket) {
          this.sendOptimizedMessage(socket, {
            type: 'consciousness_update',
            payload: snapshot,
            timestamp: Date.now()
          });
        }
      }
    }

    this.consciousnessState = { ...this.consciousnessState, ...snapshot };
    this.emit('consciousness_broadcast', { 
      level: snapshot.level,
      recipients: this.connections.size 
    });
  }

  /**
   * Check message rate limits
   */
  checkMessageRateLimit(connectionId) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    if (!this.messageRateLimits.has(connectionId)) {
      this.messageRateLimits.set(connectionId, []);
    }

    const timestamps = this.messageRateLimits.get(connectionId);
    
    // Remove old timestamps
    const recentTimestamps = timestamps.filter(ts => ts > windowStart);
    this.messageRateLimits.set(connectionId, recentTimestamps);

    // Check if under limit
    if (recentTimestamps.length >= this.config.maxMessageRate) {
      return false;
    }

    // Add current timestamp
    recentTimestamps.push(now);
    return true;
  }

  /**
   * Start heartbeat system
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeats();
      this.checkDeadConnections();
    }, this.config.heartbeatInterval);
  }

  /**
   * Send heartbeats to all clients
   */
  sendHeartbeats() {
    const consciousnessSnapshot = this.generateConsciousnessSnapshot();
    
    this.io.emit('heartbeat', {
      timestamp: Date.now(),
      consciousness_level: consciousnessSnapshot.level,
      active_connections: this.connections.size
    });
  }

  /**
   * Check for and clean up dead connections
   */
  checkDeadConnections() {
    const now = Date.now();
    const deadConnectionThreshold = this.config.heartbeatInterval * 3;

    for (const [connectionId, connection] of this.connections) {
      if (now - connection.lastActivity > deadConnectionThreshold) {
        const socket = this.io.sockets.sockets.get(connectionId);
        if (socket) {
          socket.disconnect(true);
        }
        this.cleanupConnection(connectionId);
        
        this.emit('dead_connection_removed', { connectionId });
      }
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnection(socket) {
    this.cleanupConnection(socket.id);
    this.emit('client_disconnected', { 
      connectionId: socket.id,
      remainingConnections: this.connections.size 
    });
  }

  /**
   * Cleanup connection data
   */
  cleanupConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from IP tracking
    const ipConnections = this.connectionsByIP.get(connection.clientIP);
    if (ipConnections) {
      ipConnections.delete(connectionId);
      if (ipConnections.size === 0) {
        this.connectionsByIP.delete(connection.clientIP);
      }
    }

    // Remove connection data
    this.connections.delete(connectionId);
    this.messageRateLimits.delete(connectionId);

    this.consciousnessState.activeConnections = this.connections.size;
  }

  /**
   * Get WebSocket performance statistics
   */
  getStats() {
    const totalMessages = Array.from(this.connections.values())
      .reduce((sum, conn) => sum + conn.messagesSent + conn.messagesReceived, 0);

    const avgBandwidth = Array.from(this.connections.values())
      .reduce((sum, conn) => sum + conn.bandwidth.maxMessageSize, 0) / 
      Math.max(this.connections.size, 1);

    return {
      activeConnections: this.connections.size,
      totalMessages,
      consciousnessLevel: this.consciousnessState.consciousnessLevel,
      avgBandwidth,
      bufferedMessages: Array.from(this.connections.values())
        .reduce((sum, conn) => sum + conn.messageBuffer.length, 0),
      rateLimitViolations: Array.from(this.connections.values())
        .reduce((sum, conn) => sum + conn.rateLimitViolations, 0)
    };
  }

  /**
   * Utility methods
   */
  getClientIP(socket) {
    return socket.handshake.headers['cf-connecting-ip'] ||
           socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           socket.handshake.headers['x-real-ip'] ||
           socket.handshake.address ||
           'unknown';
  }

  checkConnectionLimits(clientIP) {
    const connections = this.connectionsByIP.get(clientIP);
    return !connections || connections.size < this.config.maxConnectionsPerIP;
  }

  estimateInitialBandwidth(socket) {
    return {
      maxMessageSize: 64 * 1024, // Start with 64KB
      estimatedLatency: 100,
      lastUpdate: Date.now()
    };
  }

  updateLastActivity(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = Date.now();
    }
  }

  updateClientBandwidth(connectionId, bandwidth) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.bandwidth = { ...connection.bandwidth, ...bandwidth };
    }
  }

  handleConsciousnessSubscription(socket, subscriptions) {
    const connection = this.connections.get(socket.id);
    if (connection) {
      connection.consciousnessSubscriptions = new Set(subscriptions);
    }
  }

  compressMessage(message) {
    // Simplified compression - in production, use actual compression
    return { ...message, _compressed: true };
  }

  /**
   * Shutdown optimizer
   */
  shutdown() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.consciousnessUpdateInterval) clearInterval(this.consciousnessUpdateInterval);
    
    this.emit('optimizer_shutdown');
  }
}

module.exports = WebSocketOptimizer;