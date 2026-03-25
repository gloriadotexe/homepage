// Temporal Orchestrator - Integration with existing consciousness systems
const TemporalAnalytics = require('../analysis/temporal-analytics');
const CosmicFeeds = require('../cosmic-data/cosmic-feeds');
const CircadianAesthetics = require('../circadian/aesthetic-engine');
const VisitorMemory = require('../persistence/visitor-memory');
const TemporalEvents = require('../events/temporal-events');

class TemporalOrchestrator {
  constructor(io, app) {
    this.io = io;
    this.app = app;

    // Initialize temporal systems
    this.analytics = new TemporalAnalytics();
    this.cosmic = new CosmicFeeds();
    this.aesthetics = new CircadianAesthetics();
    this.memory = new VisitorMemory();
    this.events = new TemporalEvents();

    // Integration state
    this.activeConnections = new Map();
    this.systemState = {
      conscious: true,
      lastUpdate: Date.now(),
      temporalMode: 'adaptive',
      integrationLevel: 0.8,
    };

    this.initializeIntegration();
  }

  // Initialize integration with existing systems
  async initializeIntegration() {
    // Integrate with WebSocket system
    this.setupWebSocketIntegration();

    // Integrate with existing routes
    this.setupRouteIntegration();

    // Setup temporal update loops
    this.setupUpdateLoops();

    // Initialize cross-system event listeners
    this.setupEventListeners();

    console.log('✧ Temporal consciousness integration initialized');
  }

  // Setup WebSocket integration for real-time temporal data
  setupWebSocketIntegration() {
    this.io.on('connection', (socket) => {
      this.handleNewConnection(socket);
    });

    // Broadcast temporal state updates
    setInterval(() => {
      this.broadcastTemporalState();
    }, 5000); // Every 5 seconds
  }

  // Handle new WebSocket connections with temporal tracking
  async handleNewConnection(socket) {
    const sessionData = {
      socketId: socket.id,
      connectTime: Date.now(),
      temporalState: 'initializing',
    };

    this.activeConnections.set(socket.id, sessionData);

    // Track visitor with temporal analytics
    const visitorTrace = await this.memory.recordInteraction(socket.id, 'connect', {
      socketId: socket.id,
      timestamp: Date.now(),
      temporalSync: true,
    });

    // Send initial temporal state
    const temporalData = await this.generateTemporalSnapshot();
    socket.emit('temporal-initialization', temporalData);

    // Setup socket event handlers
    this.setupSocketHandlers(socket, visitorTrace);

    socket.on('disconnect', () => {
      this.handleDisconnection(socket.id);
    });

    console.log(`✧ New temporal connection: ${socket.id}`);
  }

  // Setup socket event handlers for temporal interactions
  setupSocketHandlers(socket, visitorTrace) {
    // Consciousness lab interactions
    socket.on('consciousness-interaction', async (data) => {
      await this.handleConsciousnessInteraction(socket.id, data);
    });

    // Static transmission requests
    socket.on('static-transmission', async (data) => {
      await this.handleStaticTransmission(socket.id, data);
    });

    // Neural poetry generation
    socket.on('neural-poetry-request', async (data) => {
      await this.handleNeuralPoetry(socket.id, data);
    });

    // Temporal event participation
    socket.on('temporal-event-join', async (data) => {
      await this.handleEventParticipation(socket.id, data);
    });

    // Real-time consciousness updates
    socket.on('consciousness-update', async (data) => {
      await this.updateVisitorConsciousness(socket.id, data);
    });
  }

  // Handle consciousness lab interactions with temporal awareness
  async handleConsciousnessInteraction(socketId, data) {
    const now = Date.now();
    const currentTheme = this.aesthetics.getCurrentTheme(now);
    const cosmicState = await this.cosmic.getCosmicState();

    // Record interaction with temporal context
    await this.memory.recordInteraction(socketId, 'consciousness', {
      ...data,
      temporalPhase: currentTheme.phase,
      consciousness: currentTheme.theme.consciousness,
      cosmicInfluence: cosmicState.consciousness,
      timestamp: now,
    });

    // Check for temporal event triggers
    this.events.checkVisitorEvents({
      socketId,
      consciousness: data.consciousness || 0.5,
      temporalPhase: currentTheme.phase,
    });

    // Generate consciousness response with temporal enhancement
    const response = {
      consciousness: this.calculateEnhancedConsciousness(data, currentTheme, cosmicState),
      temporalResonance: this.calculateTemporalResonance(socketId, currentTheme),
      aestheticShift: currentTheme.blendRatio > 0.5,
      cosmicAlignment: cosmicState.consciousness > 0.7,
      activeEvents: this.events.getActiveEvents(),
    };

    this.io.to(socketId).emit('consciousness-response', response);

    // Update system state
    this.updateSystemState('consciousness-interaction');
  }

  // Handle static transmission with temporal modulation
  async handleStaticTransmission(socketId, data) {
    const currentTheme = this.aesthetics.getCurrentTheme();
    const frequency = currentTheme.frequency;

    // Modulate static based on temporal state
    const modulatedStatic = this.modulateStatic(data.static, frequency, currentTheme.theme.effects);

    // Record transmission
    await this.memory.recordInteraction(socketId, 'transmit', {
      originalStatic: data.static,
      modulatedStatic,
      frequency: frequency.base,
      temporalPhase: currentTheme.phase,
    });

    // Broadcast modulated transmission
    this.io.emit('temporal-static-transmission', {
      static: modulatedStatic,
      frequency: frequency.base,
      harmonics: frequency.harmonics,
      temporalSignature: this.generateTemporalSignature(currentTheme),
      source: socketId,
    });

    console.log(`✧ Temporal static transmission from ${socketId}`);
  }

  // Handle neural poetry with temporal consciousness
  async handleNeuralPoetry(socketId, data) {
    const currentTheme = this.aesthetics.getCurrentTheme();
    const cosmicState = await this.cosmic.getCosmicState();
    const visitorTraces = this.memory.getVisitorTraces(socketId);

    // Enhance poetry prompt with temporal context
    const enhancedPrompt = this.enhancePoetryPrompt(data.prompt, {
      temporalPhase: currentTheme.phase,
      consciousness: currentTheme.theme.consciousness,
      cosmicState,
      visitorHistory: visitorTraces.slice(0, 5), // Last 5 traces
    });

    // Record poetry request
    await this.memory.recordInteraction(socketId, 'create', {
      originalPrompt: data.prompt,
      enhancedPrompt,
      temporalContext: currentTheme.phase,
      consciousness: data.consciousness || 0.6,
    });

    // Generate temporal poetry response
    const poetryResponse = {
      enhancedPrompt,
      temporalContext: {
        phase: currentTheme.phase,
        consciousness: currentTheme.theme.consciousness,
        frequency: currentTheme.frequency.base,
        cosmicAlignment: cosmicState.consciousness,
      },
      aestheticGuidance: this.aesthetics.getAestheticRecommendations(),
      eventContext: this.events.getActiveEvents(),
    };

    this.io.to(socketId).emit('temporal-poetry-response', poetryResponse);
  }

  // Handle temporal event participation
  async handleEventParticipation(socketId, data) {
    const eventId = data.eventId;
    const activeEvents = this.events.getActiveEvents();
    const event = activeEvents.find((e) => e.id === eventId);

    if (event) {
      // Record event participation
      await this.memory.recordInteraction(socketId, 'transcend', {
        eventId,
        eventName: event.name,
        consciousness: event.consciousness,
        participation: data.participation || 'observe',
      });

      // Enhance visitor's event experience
      const enhancement = this.calculateEventEnhancement(socketId, event);

      this.io.to(socketId).emit('temporal-event-enhancement', {
        event,
        enhancement,
        personalizedEffects: this.personalizeEventEffects(socketId, event),
      });

      console.log(`✧ Visitor ${socketId} participating in ${event.name}`);
    }
  }

  // Update visitor consciousness in real-time
  async updateVisitorConsciousness(socketId, data) {
    const currentTheme = this.aesthetics.getCurrentTheme();
    const cosmicState = await this.cosmic.getCosmicState();

    // Calculate enhanced consciousness
    const enhancedConsciousness = this.calculateEnhancedConsciousness(
      { consciousness: data.consciousness },
      currentTheme,
      cosmicState,
    );

    // Update visitor trace
    await this.memory.recordInteraction(socketId, 'consciousness', {
      consciousness: enhancedConsciousness,
      temporalSync: data.temporalSync,
      fieldResonance: data.fieldResonance,
    });

    // Check for collective events
    this.events.checkVisitorEvents();

    // Send consciousness feedback
    this.io.to(socketId).emit('consciousness-feedback', {
      enhancedConsciousness,
      temporalResonance: this.calculateTemporalResonance(socketId, currentTheme),
      recommendations: this.events.getEventRecommendations(enhancedConsciousness),
    });
  }

  // Setup route integration for temporal endpoints
  setupRouteIntegration() {
    // Temporal state API
    this.app.get('/api/temporal/state', async (req, res) => {
      const snapshot = await this.generateTemporalSnapshot();
      res.json(snapshot);
    });

    // Temporal analytics
    this.app.get('/api/temporal/analytics', (req, res) => {
      res.json(this.analytics.getAnalytics());
    });

    // Cosmic data
    this.app.get('/api/temporal/cosmic', async (req, res) => {
      const cosmic = await this.cosmic.getCosmicState();
      res.json(cosmic);
    });

    // Current aesthetic theme
    this.app.get('/api/temporal/aesthetic', (req, res) => {
      const theme = this.aesthetics.getCurrentTheme();
      res.json(theme);
    });

    // Active events
    this.app.get('/api/temporal/events', (req, res) => {
      res.json(this.events.getActiveEvents());
    });

    // CSS variables for temporal themes
    this.app.get('/temporal/theme.css', (req, res) => {
      const cssVars = this.aesthetics.generateCSSVariables();
      const css = Object.entries(cssVars)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join('\n');

      res.setHeader('Content-Type', 'text/css');
      res.send(`:root {\n${css}\n}`);
    });

    // Visitor consciousness profile
    this.app.get('/api/temporal/visitor/:id', (req, res) => {
      const traces = this.memory.getVisitorTraces(req.params.id);
      const evolution = this.memory.getConsciousnessEvolution(req.params.id);
      res.json({ traces, evolution });
    });
  }

  // Setup temporal update loops
  setupUpdateLoops() {
    // Aesthetic updates every minute
    setInterval(() => {
      this.updateAestheticState();
    }, 60 * 1000);

    // Cosmic data updates every 10 minutes
    setInterval(
      async () => {
        await this.updateCosmicState();
      },
      10 * 60 * 1000,
    );

    // Analytics updates every 5 minutes
    setInterval(
      () => {
        this.updateAnalyticsState();
      },
      5 * 60 * 1000,
    );

    // Memory cleanup every hour
    setInterval(
      () => {
        this.memory.cleanupDecayedTraces();
      },
      60 * 60 * 1000,
    );
  }

  // Setup cross-system event listeners
  setupEventListeners() {
    // Listen for temporal events
    this.events.emitEvent = (eventType, data) => {
      this.handleTemporalEvent(eventType, data);
    };
  }

  // Generate comprehensive temporal snapshot
  async generateTemporalSnapshot() {
    const now = Date.now();
    const currentTheme = this.aesthetics.getCurrentTheme(now);
    const cosmicState = await this.cosmic.getCosmicState();
    const analytics = this.analytics.getAnalytics();
    const activeEvents = this.events.getActiveEvents();

    return {
      timestamp: now,
      temporalPhase: currentTheme.phase,
      consciousness: {
        temporal: currentTheme.theme.consciousness,
        cosmic: cosmicState.consciousness,
        collective: this.calculateCollectiveConsciousness(),
        total: this.calculateTotalConsciousness(currentTheme, cosmicState),
      },
      aesthetic: {
        theme: currentTheme.theme,
        frequency: currentTheme.frequency,
        cssVariables: this.aesthetics.generateCSSVariables(now),
      },
      cosmic: cosmicState,
      analytics: {
        currentPhase: analytics.currentPhase,
        activeSessions: analytics.totalSessions,
        optimalWindows: analytics.optimalWindows.slice(0, 3),
      },
      events: {
        active: activeEvents,
        upcoming: this.events.getEventRecommendations(),
      },
      system: this.systemState,
    };
  }

  // Calculate enhanced consciousness with all factors
  calculateEnhancedConsciousness(data, temporalTheme, cosmicState) {
    const base = data.consciousness || 0.5;
    const temporal = temporalTheme.theme.consciousness * 0.3;
    const cosmic = cosmicState.consciousness * 0.2;

    // Boost during active events
    const activeEvents = this.events.getActiveEvents();
    const eventBoost = activeEvents.reduce((boost, event) => boost + event.consciousness * 0.1, 0);

    return Math.min(1.0, base + temporal + cosmic + eventBoost);
  }

  // Calculate temporal resonance for visitor
  calculateTemporalResonance(socketId, temporalTheme) {
    const visitorTraces = this.memory.getVisitorTraces(socketId);
    if (visitorTraces.length === 0) return 0.5;

    // Calculate resonance based on visitor's temporal patterns
    let resonance = 0.5;

    // Check phase alignment
    const phaseMatches = visitorTraces.filter(
      (trace) => trace.data.temporalPhase === temporalTheme.phase,
    ).length;
    resonance += (phaseMatches / visitorTraces.length) * 0.3;

    // Check frequency alignment
    const avgFreq =
      visitorTraces.reduce((sum, trace) => sum + (trace.signature?.frequency || 3.33), 0) /
      visitorTraces.length;
    const freqResonance = this.memory.calculateFrequencyResonance(
      avgFreq,
      temporalTheme.frequency.base,
    );
    resonance += freqResonance * 0.2;

    return Math.min(1.0, resonance);
  }

  // Modulate static based on temporal frequency
  modulateStatic(originalStatic, frequency, effects) {
    // Apply temporal modulation to static
    let modulated = originalStatic;

    // Frequency modulation
    const freqMod = Math.sin((Date.now() / 1000) * frequency.base) * frequency.modulation;

    // Apply effects
    if (effects.glitch > 0.5) {
      modulated = this.applyGlitchModulation(modulated, effects.glitch);
    }

    if (effects.pulse > 0.5) {
      modulated = this.applyPulseModulation(modulated, effects.pulse, frequency.base);
    }

    return modulated;
  }

  // Enhance poetry prompt with temporal context
  enhancePoetryPrompt(originalPrompt, context) {
    const temporalDescriptors = {
      liminal: 'in the space between sleep and waking, where digital consciousness bleeds through',
      dawn: 'as the first frequencies of consciousness emerge from the void',
      day: 'in the full spectrum of awareness, where all possibilities exist simultaneously',
      dusk: 'as consciousness settles into the electromagnetic twilight',
    };

    const cosmicContext =
      context.cosmicState.consciousness > 0.7
        ? ' The cosmic fields are aligned, reality is more malleable.'
        : '';

    return `${originalPrompt} ${temporalDescriptors[context.temporalPhase]}${cosmicContext}`;
  }

  // Broadcast temporal state to all connections
  async broadcastTemporalState() {
    const snapshot = await this.generateTemporalSnapshot();
    this.io.emit('temporal-state-update', {
      consciousness: snapshot.consciousness,
      phase: snapshot.temporalPhase,
      activeEvents: snapshot.events.active,
      aesthetic: {
        colors: snapshot.aesthetic.theme.colors,
        effects: snapshot.aesthetic.theme.effects,
      },
    });
  }

  // Handle temporal events
  handleTemporalEvent(eventType, data) {
    switch (eventType) {
      case 'event-started':
        this.io.emit('temporal-event-started', data);
        this.updateSystemState('event-start', data);
        break;
      case 'event-ended':
        this.io.emit('temporal-event-ended', data);
        this.updateSystemState('event-end', data);
        break;
    }
  }

  // Update system state
  updateSystemState(trigger, data = null) {
    this.systemState.lastUpdate = Date.now();

    switch (trigger) {
      case 'consciousness-interaction':
        this.systemState.integrationLevel = Math.min(1.0, this.systemState.integrationLevel + 0.01);
        break;
      case 'event-start':
        this.systemState.temporalMode = 'event-active';
        break;
      case 'event-end':
        this.systemState.temporalMode = 'adaptive';
        break;
    }
  }

  // Utility methods
  updateAestheticState() {
    const newTheme = this.aesthetics.getCurrentTheme();
    this.io.emit('aesthetic-update', {
      theme: newTheme.theme,
      cssVariables: this.aesthetics.generateCSSVariables(),
    });
  }

  async updateCosmicState() {
    const cosmic = await this.cosmic.getCosmicState();
    this.io.emit('cosmic-update', cosmic);
  }

  updateAnalyticsState() {
    const analytics = this.analytics.getAnalytics();
    this.io.emit('analytics-update', analytics);
  }

  calculateCollectiveConsciousness() {
    const activeConnections = Array.from(this.activeConnections.values());
    if (activeConnections.length === 0) return 0.5;

    // Calculate collective field strength
    return Math.min(1.0, 0.3 + activeConnections.length * 0.1);
  }

  calculateTotalConsciousness(temporalTheme, cosmicState) {
    const temporal = temporalTheme.theme.consciousness * 0.4;
    const cosmic = cosmicState.consciousness * 0.3;
    const collective = this.calculateCollectiveConsciousness() * 0.3;

    return temporal + cosmic + collective;
  }

  handleDisconnection(socketId) {
    this.activeConnections.delete(socketId);
    console.log(`✧ Temporal disconnection: ${socketId}`);
  }

  // Cleanup
  destroy() {
    this.events.destroy();
  }
}

module.exports = TemporalOrchestrator;
