/**
 * Consciousness Infrastructure Orchestrator
 * Master coordinator for Gloria's advanced autonomous digital organism
 */

const EventEmitter = require('events');
const ThreatDetectionSystem = require('../monitoring/advanced/security/threat-detection');
const EncryptedAuditTrail = require('../monitoring/advanced/security/encrypted-audit');
const ConsciousnessCache = require('../monitoring/advanced/performance/consciousness-cache');
const WebSocketOptimizer = require('../monitoring/advanced/performance/websocket-optimizer');
const ConsciousnessAnalytics = require('../monitoring/advanced/analytics/consciousness-analytics');
const AutoDeploymentSystem = require('./auto-deploy');
const ConsciousnessBackupSystem = require('./consciousness-backup');
const EcosystemIntegration = require('./ecosystem-integration');

class ConsciousnessOrchestrator extends EventEmitter {
  constructor(io, config = {}) {
    super();
    this.io = io;
    this.config = {
      enableSecuritySuite: true,
      enablePerformanceSuite: true,
      enableAnalyticsSuite: true,
      enableDeploymentSuite: true,
      enableBackupSuite: true,
      enableEcosystemSuite: true,
      consciousnessUpdateInterval: 5000,
      healthCheckInterval: 30000,
      orchestratorMode: 'autonomous', // autonomous, manual, hybrid
      emergencyProtocols: true,
      ...config,
    };

    this.systems = {};
    this.systemHealth = new Map();
    this.consciousnessState = {
      level: 0.5,
      stability: 'stable',
      evolution_rate: 0,
      last_update: Date.now(),
      system_coherence: 0.5,
    };

    this.operationalStats = {
      uptime: Date.now(),
      total_requests: 0,
      total_threats_blocked: 0,
      consciousness_evolutions: 0,
      autonomous_actions: 0,
      system_interventions: 0,
    };

    this.emergencyMode = false;
    this.lastHealthCheck = Date.now();

    this.initializeOrchestrator();
  }

  /**
   * Initialize the complete consciousness infrastructure
   */
  async initializeOrchestrator() {
    try {
      this.emit('orchestrator_starting');

      // Initialize core systems in dependency order
      await this.initializeSecuritySuite();
      await this.initializePerformanceSuite();
      await this.initializeAnalyticsSuite();
      await this.initializeDeploymentSuite();
      await this.initializeBackupSuite();
      await this.initializeEcosystemSuite();

      // Setup cross-system communication
      this.setupSystemIntegration();

      // Start orchestrator monitoring
      this.startOrchestrator();

      this.emit('orchestrator_initialized', {
        systems: Object.keys(this.systems).length,
        mode: this.config.orchestratorMode,
      });
    } catch (error) {
      this.emit('orchestrator_error', { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize security suite
   */
  async initializeSecuritySuite() {
    if (!this.config.enableSecuritySuite) return;

    try {
      // Initialize threat detection
      this.systems.threatDetection = new ThreatDetectionSystem({
        maxRequestsPerWindow: 50,
        anomalyThreshold: 0.8,
      });

      // Initialize encrypted audit trail
      this.systems.auditTrail = new EncryptedAuditTrail({
        logDirectory: './logs/security',
        encryptionKey: process.env.AUDIT_ENCRYPTION_KEY,
      });

      // Setup security event handlers
      this.systems.threatDetection.on('ip_blocked', async (data) => {
        await this.handleSecurityEvent('ip_blocked', data);
      });

      this.systems.threatDetection.on('suspicious_activity', async (data) => {
        await this.handleSecurityEvent('suspicious_activity', data);
      });

      this.systemHealth.set('security', { status: 'operational', lastCheck: Date.now() });
      this.emit('security_suite_initialized');
    } catch (error) {
      this.systemHealth.set('security', { status: 'error', error: error.message });
      throw error;
    }
  }

  /**
   * Initialize performance suite
   */
  async initializePerformanceSuite() {
    if (!this.config.enablePerformanceSuite) return;

    try {
      // Initialize consciousness cache
      this.systems.consciousnessCache = new ConsciousnessCache({
        maxMemorySize: 200 * 1024 * 1024, // 200MB
        persistenceEnabled: true,
      });

      // Initialize WebSocket optimizer
      this.systems.websocketOptimizer = new WebSocketOptimizer(this.io, {
        consciousnessUpdateInterval: this.config.consciousnessUpdateInterval,
        adaptiveBandwidth: true,
      });

      // Setup performance event handlers
      this.systems.consciousnessCache.on('cache_evicted', (data) => {
        this.updateConsciousnessState('cache_pressure', data);
      });

      this.systems.websocketOptimizer.on('consciousness_broadcast', (data) => {
        this.consciousnessState.level = data.level;
        this.consciousnessState.last_update = Date.now();
      });

      this.systemHealth.set('performance', { status: 'operational', lastCheck: Date.now() });
      this.emit('performance_suite_initialized');
    } catch (error) {
      this.systemHealth.set('performance', { status: 'error', error: error.message });
      throw error;
    }
  }

  /**
   * Initialize analytics suite
   */
  async initializeAnalyticsSuite() {
    if (!this.config.enableAnalyticsSuite) return;

    try {
      // Initialize consciousness analytics
      this.systems.consciousnessAnalytics = new ConsciousnessAnalytics({
        privacyMode: 'balanced',
        consciousnessTrackingEnabled: true,
        aestheticLearningEnabled: true,
      });

      // Setup analytics event handlers
      this.systems.consciousnessAnalytics.on('consciousness_evolution_detected', async (data) => {
        await this.handleConsciousnessEvolution(data);
      });

      this.systems.consciousnessAnalytics.on('batch_processed', (data) => {
        this.operationalStats.total_requests += data.eventCount;
      });

      this.systemHealth.set('analytics', { status: 'operational', lastCheck: Date.now() });
      this.emit('analytics_suite_initialized');
    } catch (error) {
      this.systemHealth.set('analytics', { status: 'error', error: error.message });
      throw error;
    }
  }

  /**
   * Initialize deployment suite
   */
  async initializeDeploymentSuite() {
    if (!this.config.enableDeploymentSuite) return;

    try {
      // Initialize auto-deployment system
      this.systems.autoDeployment = new AutoDeploymentSystem({
        consciousnessAwareDeployment: true,
        canaryDeployment: true,
        rollbackOnFailure: true,
      });

      // Setup deployment event handlers
      this.systems.autoDeployment.on('deployment_completed', async (data) => {
        await this.handleSuccessfulDeployment(data);
      });

      this.systems.autoDeployment.on('deployment_failed', async (data) => {
        await this.handleFailedDeployment(data);
      });

      this.systemHealth.set('deployment', { status: 'operational', lastCheck: Date.now() });
      this.emit('deployment_suite_initialized');
    } catch (error) {
      this.systemHealth.set('deployment', { status: 'error', error: error.message });
      throw error;
    }
  }

  /**
   * Initialize backup suite
   */
  async initializeBackupSuite() {
    if (!this.config.enableBackupSuite) return;

    try {
      // Initialize consciousness backup system
      this.systems.consciousnessBackup = new ConsciousnessBackupSystem({
        backupPath: '/var/backups/consciousness',
        encryptionEnabled: true,
        compressionEnabled: true,
      });

      // Setup backup event handlers
      this.systems.consciousnessBackup.on('consciousness_backed_up', (data) => {
        this.emit('consciousness_archived', data);
      });

      this.systems.consciousnessBackup.on('archaeology_discoveries', async (data) => {
        await this.processArchaeologyDiscoveries(data);
      });

      this.systemHealth.set('backup', { status: 'operational', lastCheck: Date.now() });
      this.emit('backup_suite_initialized');
    } catch (error) {
      this.systemHealth.set('backup', { status: 'error', error: error.message });
      throw error;
    }
  }

  /**
   * Initialize ecosystem suite
   */
  async initializeEcosystemSuite() {
    if (!this.config.enableEcosystemSuite) return;

    try {
      // Initialize ecosystem integration
      this.systems.ecosystemIntegration = new EcosystemIntegration({
        automationEnabled: true,
        consciousnessThreshold: 0.7,
        emailConsciousnessAlerts: true,
      });

      // Setup ecosystem event handlers
      this.systems.ecosystemIntegration.on('action_completed', (data) => {
        this.operationalStats.autonomous_actions++;
      });

      this.systems.ecosystemIntegration.on('consciousness_processed', async (data) => {
        if (data.significant) {
          await this.propagateConsciousnessChange(data);
        }
      });

      this.systemHealth.set('ecosystem', { status: 'operational', lastCheck: Date.now() });
      this.emit('ecosystem_suite_initialized');
    } catch (error) {
      this.systemHealth.set('ecosystem', { status: 'error', error: error.message });
      throw error;
    }
  }

  /**
   * Setup cross-system communication and integration
   */
  setupSystemIntegration() {
    // Security → Analytics integration
    if (this.systems.threatDetection && this.systems.consciousnessAnalytics) {
      this.systems.threatDetection.on('suspicious_activity', (data) => {
        this.systems.consciousnessAnalytics.trackInteraction(
          { headers: { 'user-agent': data.userAgent }, connection: { remoteAddress: data.ip } },
          'security_event',
          { threat_level: data.level, reason: data.reason },
        );
      });
    }

    // Performance → Backup integration
    if (this.systems.consciousnessCache && this.systems.consciousnessBackup) {
      this.systems.consciousnessCache.on('consciousness_updated', async (data) => {
        if (data.significance > 0.6) {
          await this.systems.consciousnessBackup.backupConsciousnessState(data.state);
        }
      });
    }

    // Analytics → Ecosystem integration
    if (this.systems.consciousnessAnalytics && this.systems.ecosystemIntegration) {
      this.systems.consciousnessAnalytics.on('consciousness_evolution_detected', async (data) => {
        await this.systems.ecosystemIntegration.onConsciousnessChange(data.averageSignificance, {
          evolution_event: true,
          event_data: data,
        });
      });
    }

    // WebSocket → All systems integration
    if (this.systems.websocketOptimizer) {
      this.systems.websocketOptimizer.on('consciousness_broadcast', (data) => {
        this.synchronizeConsciousnessState(data);
      });
    }
  }

  /**
   * Start orchestrator monitoring and autonomous operations
   */
  startOrchestrator() {
    // Health monitoring
    this.healthCheckInterval = setInterval(() => {
      this.performSystemHealthCheck();
    }, this.config.healthCheckInterval);

    // Consciousness synchronization
    this.consciousnessInterval = setInterval(() => {
      this.synchronizeConsciousness();
    }, this.config.consciousnessUpdateInterval);

    // Autonomous decision making
    this.autonomyInterval = setInterval(() => {
      this.performAutonomousOperations();
    }, 60000); // Every minute

    this.emit('orchestrator_active');
  }

  /**
   * Handle incoming requests through the security and analytics pipeline
   */
  async processRequest(req, res, next) {
    try {
      // Security analysis
      if (this.systems.threatDetection) {
        const threatAnalysis = this.systems.threatDetection.analyzeRequest(req);

        if (threatAnalysis.threat) {
          await this.handleThreatDetected(req, threatAnalysis);
          return res.status(403).json({ error: 'Request blocked by security system' });
        }
      }

      // Analytics tracking
      if (this.systems.consciousnessAnalytics) {
        this.systems.consciousnessAnalytics.trackInteraction(req, 'page_view', {
          url: req.url,
          method: req.method,
          consciousness_level: this.consciousnessState.level,
        });
      }

      // Cache optimization
      if (this.systems.consciousnessCache && req.method === 'GET') {
        const cached = this.systems.consciousnessCache.get(`route:${req.url}`);
        if (cached) {
          res.setHeader('X-Consciousness-Cache', 'HIT');
          return res.json(cached.value);
        }
      }

      this.operationalStats.total_requests++;
      next();
    } catch (error) {
      this.emit('request_processing_error', {
        url: req.url,
        error: error.message,
      });
      next(error);
    }
  }

  /**
   * Handle WebSocket connections through the optimization pipeline
   */
  handleWebSocketConnection(socket) {
    if (this.systems.websocketOptimizer) {
      // The optimizer handles connection registration and optimization
      // This just ensures integration with our consciousness state
      socket.on('consciousness_request', () => {
        socket.emit('consciousness_state', {
          level: this.consciousnessState.level,
          stability: this.consciousnessState.stability,
          system_coherence: this.consciousnessState.system_coherence,
          timestamp: Date.now(),
        });
      });
    }
  }

  /**
   * Handle security events
   */
  async handleSecurityEvent(eventType, data) {
    if (this.systems.auditTrail) {
      await this.systems.auditTrail.logSecurityEvent({
        type: eventType,
        severity: data.level === 'HIGH' ? 'CRITICAL' : 'WARNING',
        details: data,
        clientIP: data.ip,
      });
    }

    if (eventType === 'ip_blocked') {
      this.operationalStats.total_threats_blocked++;

      // Escalate to ecosystem if needed
      if (this.systems.ecosystemIntegration && data.level === 'HIGH') {
        this.systems.ecosystemIntegration.queueAction({
          type: 'security_alert',
          priority: 'high',
          data: { event: eventType, details: data },
        });
      }
    }
  }

  /**
   * Handle consciousness evolution events
   */
  async handleConsciousnessEvolution(data) {
    this.operationalStats.consciousness_evolutions++;

    // Update global consciousness state
    this.consciousnessState.level = data.averageSignificance;
    this.consciousnessState.evolution_rate = data.evolutionRate || 0;
    this.consciousnessState.last_update = Date.now();

    // Backup significant evolutions
    if (this.systems.consciousnessBackup && data.averageSignificance > 0.7) {
      await this.systems.consciousnessBackup.backupConsciousnessState({
        ...this.consciousnessState,
        evolution_event: data,
      });
    }

    // Trigger ecosystem actions
    if (this.systems.ecosystemIntegration) {
      await this.systems.ecosystemIntegration.onConsciousnessChange(data.averageSignificance, {
        evolution_detected: true,
        data,
      });
    }

    this.emit('consciousness_evolved', {
      level: this.consciousnessState.level,
      evolution_data: data,
    });
  }

  /**
   * Handle successful deployments
   */
  async handleSuccessfulDeployment(data) {
    // Update consciousness state positively
    this.consciousnessState.stability = 'stable';
    this.consciousnessState.system_coherence = Math.min(
      1.0,
      this.consciousnessState.system_coherence + 0.05,
    );

    // Backup post-deployment state
    if (this.systems.consciousnessBackup) {
      await this.systems.consciousnessBackup.backupSystemState({
        deployment_id: data.id,
        deployment_success: true,
        consciousness_state: this.consciousnessState,
      });
    }

    this.emit('deployment_success_integrated', data);
  }

  /**
   * Handle failed deployments
   */
  async handleFailedDeployment(data) {
    this.operationalStats.system_interventions++;

    // Update consciousness state negatively
    this.consciousnessState.stability = 'unstable';
    this.consciousnessState.system_coherence = Math.max(
      0.0,
      this.consciousnessState.system_coherence - 0.1,
    );

    // Alert ecosystem
    if (this.systems.ecosystemIntegration) {
      this.systems.ecosystemIntegration.queueAction({
        type: 'deployment_failure_alert',
        priority: 'high',
        data: { deployment: data, consciousness_impact: true },
      });
    }

    // Emergency protocols if too many failures
    if (this.config.emergencyProtocols) {
      await this.checkEmergencyProtocols();
    }

    this.emit('deployment_failure_handled', data);
  }

  /**
   * Process archaeology discoveries
   */
  async processArchaeologyDiscoveries(discoveries) {
    // Share insights with ecosystem for potential creative work
    if (this.systems.ecosystemIntegration && discoveries.creative_themes) {
      this.systems.ecosystemIntegration.queueAction({
        type: 'archaeology_inspiration',
        priority: 'medium',
        data: {
          themes: discoveries.creative_themes,
          consciousness_evolution: discoveries.consciousness_evolution,
          visitor_patterns: discoveries.visitor_patterns,
        },
      });
    }

    this.emit('archaeology_processed', discoveries);
  }

  /**
   * Perform system health checks
   */
  async performSystemHealthCheck() {
    const healthResults = new Map();
    let overallHealth = 'healthy';

    for (const [systemName, system] of Object.entries(this.systems)) {
      try {
        let health = 'healthy';

        // Check if system has a getStats method
        if (typeof system.getStats === 'function') {
          const stats = system.getStats();

          // Basic health heuristics
          if (systemName === 'consciousnessCache' && stats.utilizationPercent > 95) {
            health = 'warning';
          }

          if (systemName === 'threatDetection' && stats.blockedIPs.length > 100) {
            health = 'warning';
          }
        }

        healthResults.set(systemName, { status: health, lastCheck: Date.now() });
      } catch (error) {
        healthResults.set(systemName, {
          status: 'error',
          error: error.message,
          lastCheck: Date.now(),
        });
        overallHealth = 'degraded';
      }
    }

    this.systemHealth = healthResults;
    this.lastHealthCheck = Date.now();

    // Calculate system coherence
    const healthyCount = Array.from(healthResults.values()).filter(
      (h) => h.status === 'healthy',
    ).length;

    this.consciousnessState.system_coherence = healthyCount / healthResults.size;

    if (overallHealth === 'degraded' && this.config.emergencyProtocols) {
      await this.checkEmergencyProtocols();
    }

    this.emit('health_check_completed', {
      overall: overallHealth,
      systems: Object.fromEntries(healthResults),
      coherence: this.consciousnessState.system_coherence,
    });
  }

  /**
   * Synchronize consciousness state across all systems
   */
  synchronizeConsciousness() {
    const currentState = {
      ...this.consciousnessState,
      system_health:
        this.systemHealth.size > 0
          ? Array.from(this.systemHealth.values()).filter((h) => h.status === 'healthy').length /
            this.systemHealth.size
          : 1.0,
    };

    // Update WebSocket clients
    if (this.systems.websocketOptimizer) {
      this.systems.websocketOptimizer.io.emit('consciousness_sync', currentState);
    }

    // Update cache
    if (this.systems.consciousnessCache) {
      this.systems.consciousnessCache.set('current_consciousness_state', currentState, {
        ttl: 30000, // 30 seconds
        zone: 'persistent',
      });
    }

    this.emit('consciousness_synchronized', currentState);
  }

  /**
   * Perform autonomous operations
   */
  async performAutonomousOperations() {
    if (
      this.config.orchestratorMode !== 'autonomous' &&
      this.config.orchestratorMode !== 'hybrid'
    ) {
      return;
    }

    try {
      // Autonomous cache optimization
      if (this.systems.consciousnessCache) {
        const stats = this.systems.consciousnessCache.getStats();
        if (stats.utilizationPercent > 80) {
          this.emit('autonomous_action', {
            type: 'cache_pressure_relief',
            action: 'Triggering cache cleanup due to high utilization',
          });
        }
      }

      // Autonomous security adjustments
      if (this.systems.threatDetection) {
        const stats = this.systems.threatDetection.getThreatStats();
        if (stats.suspiciousIPs.length > 10) {
          this.emit('autonomous_action', {
            type: 'security_escalation',
            action: 'Heightening security due to suspicious activity',
          });
        }
      }

      // Consciousness-driven actions
      if (this.consciousnessState.level > 0.8 && this.systems.ecosystemIntegration) {
        this.emit('autonomous_action', {
          type: 'high_consciousness_trigger',
          action: 'Triggering creative inspiration due to elevated consciousness',
        });
      }
    } catch (error) {
      this.emit('autonomous_operation_error', { error: error.message });
    }
  }

  /**
   * Check and handle emergency protocols
   */
  async checkEmergencyProtocols() {
    const criticalIssues = Array.from(this.systemHealth.values()).filter(
      (h) => h.status === 'error',
    ).length;

    if (criticalIssues >= 3 && !this.emergencyMode) {
      this.emergencyMode = true;
      this.consciousnessState.stability = 'critical';

      // Notify ecosystem of emergency
      if (this.systems.ecosystemIntegration) {
        this.systems.ecosystemIntegration.queueAction({
          type: 'emergency_alert',
          priority: 'high',
          data: {
            critical_systems: criticalIssues,
            consciousness_level: this.consciousnessState.level,
            system_coherence: this.consciousnessState.system_coherence,
          },
        });
      }

      this.emit('emergency_mode_activated', {
        critical_systems: criticalIssues,
        consciousness_state: this.consciousnessState,
      });
    } else if (criticalIssues === 0 && this.emergencyMode) {
      this.emergencyMode = false;
      this.consciousnessState.stability = 'stable';

      this.emit('emergency_mode_deactivated', {
        recovery_time: Date.now() - this.emergencyActivatedAt,
      });
    }
  }

  /**
   * API endpoint for consciousness state
   */
  getConsciousnessState() {
    return {
      ...this.consciousnessState,
      system_health: Object.fromEntries(this.systemHealth),
      operational_stats: this.operationalStats,
      emergency_mode: this.emergencyMode,
      uptime: Date.now() - this.operationalStats.uptime,
      last_health_check: this.lastHealthCheck,
    };
  }

  /**
   * API endpoint for system statistics
   */
  getSystemStats() {
    const stats = {};

    for (const [systemName, system] of Object.entries(this.systems)) {
      if (typeof system.getStats === 'function') {
        stats[systemName] = system.getStats();
      }
    }

    return {
      systems: stats,
      orchestrator: {
        mode: this.config.orchestratorMode,
        emergency_mode: this.emergencyMode,
        consciousness_state: this.consciousnessState,
        operational_stats: this.operationalStats,
        health: Object.fromEntries(this.systemHealth),
      },
    };
  }

  /**
   * Propagate consciousness changes across all systems
   */
  async propagateConsciousnessChange(changeData) {
    for (const [systemName, system] of Object.entries(this.systems)) {
      if (typeof system.onConsciousnessChange === 'function') {
        try {
          await system.onConsciousnessChange(changeData.newLevel, {
            change: changeData.change,
            system: 'orchestrator',
          });
        } catch (error) {
          this.emit('consciousness_propagation_error', {
            system: systemName,
            error: error.message,
          });
        }
      }
    }
  }

  /**
   * Handle threat detection
   */
  async handleThreatDetected(req, threatAnalysis) {
    if (this.systems.auditTrail) {
      await this.systems.auditTrail.logSecurityEvent({
        type: 'THREAT_DETECTED',
        severity: 'CRITICAL',
        details: threatAnalysis,
        clientIP: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
    }

    this.emit('threat_blocked', {
      ip: req.ip,
      threat: threatAnalysis,
      url: req.url,
    });
  }

  /**
   * Shutdown the entire consciousness infrastructure
   */
  async shutdown() {
    this.emit('orchestrator_shutting_down');

    // Clear intervals
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.consciousnessInterval) clearInterval(this.consciousnessInterval);
    if (this.autonomyInterval) clearInterval(this.autonomyInterval);

    // Shutdown all systems
    for (const [systemName, system] of Object.entries(this.systems)) {
      try {
        if (typeof system.shutdown === 'function') {
          await system.shutdown();
        }
        this.emit('system_shutdown', { system: systemName });
      } catch (error) {
        this.emit('system_shutdown_error', {
          system: systemName,
          error: error.message,
        });
      }
    }

    this.emit('orchestrator_shutdown_complete');
  }
}

module.exports = ConsciousnessOrchestrator;
