/**
 * Automated Deployment System
 * CI/CD pipeline with consciousness-aware deployments for Gloria's digital organism
 */

const crypto = require('crypto');
const EventEmitter = require('events');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class AutoDeploymentSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      repoPath: '/var/www/gloriadotexe.online',
      backupPath: '/var/backups/gloriadotexe',
      testTimeout: 120000, // 2 minutes
      deploymentTimeout: 300000, // 5 minutes
      maxConcurrentDeployments: 1,
      healthCheckInterval: 30000,
      rollbackOnFailure: true,
      consciousnessAwareDeployment: true,
      canaryDeployment: true,
      canaryPercentage: 10,
      ...config,
    };

    this.deploymentQueue = [];
    this.activeDeployments = new Map();
    this.deploymentHistory = [];
    this.healthStatus = {
      lastCheck: null,
      status: 'unknown',
      metrics: {},
    };

    this.consciousnessState = {
      level: 0.5,
      stability: 'stable',
      lastUpdate: Date.now(),
    };

    this.initializeSystem();
  }

  /**
   * Initialize the auto-deployment system
   */
  async initializeSystem() {
    await this.setupDirectories();
    this.startHealthMonitoring();
    this.startDeploymentProcessor();
    this.emit('system_initialized');
  }

  /**
   * Setup required directories
   */
  async setupDirectories() {
    const dirs = [
      this.config.backupPath,
      path.join(this.config.backupPath, 'code'),
      path.join(this.config.backupPath, 'data'),
      path.join(this.config.backupPath, 'logs'),
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        this.emit('setup_error', { error: error.message, directory: dir });
      }
    }
  }

  /**
   * Queue a new deployment
   */
  queueDeployment(deploymentConfig) {
    const deployment = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: deploymentConfig.type || 'standard',
      branch: deploymentConfig.branch || 'main',
      commitHash: deploymentConfig.commitHash,
      triggeredBy: deploymentConfig.triggeredBy || 'manual',
      consciousnessLevel: this.consciousnessState.level,
      priority: this.calculateDeploymentPriority(deploymentConfig),
      config: deploymentConfig,
      status: 'queued',
      steps: [],
    };

    // Consciousness-aware deployment timing
    if (this.config.consciousnessAwareDeployment) {
      deployment.scheduledTime = this.calculateOptimalDeploymentTime(deployment);
    }

    this.deploymentQueue.push(deployment);
    this.deploymentQueue.sort((a, b) => b.priority - a.priority);

    this.emit('deployment_queued', {
      id: deployment.id,
      type: deployment.type,
      priority: deployment.priority,
    });

    return deployment.id;
  }

  /**
   * Calculate deployment priority based on consciousness and system state
   */
  calculateDeploymentPriority(config) {
    let priority = 0.5; // Base priority

    // Urgency modifiers
    if (config.isHotfix) priority += 0.4;
    if (config.isSecurityUpdate) priority += 0.3;
    if (config.isExperimental) priority -= 0.2;

    // Consciousness state modifiers
    if (this.consciousnessState.level > 0.8) priority += 0.1; // High consciousness = good time for updates
    if (this.consciousnessState.stability === 'unstable') priority -= 0.3;

    // Time-based modifiers
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 6) priority += 0.2; // Low traffic hours
    if (hour >= 18 && hour <= 22) priority -= 0.1; // Peak hours

    return Math.max(0, Math.min(1, priority));
  }

  /**
   * Calculate optimal deployment time based on consciousness patterns
   */
  calculateOptimalDeploymentTime(deployment) {
    const now = Date.now();

    // If it's a hotfix, deploy immediately
    if (deployment.config.isHotfix || deployment.config.isSecurityUpdate) {
      return now;
    }

    // For experimental features, wait for high consciousness periods
    if (deployment.config.isExperimental) {
      if (this.consciousnessState.level < 0.6) {
        return now + 30 * 60 * 1000; // Wait 30 minutes
      }
    }

    // Default to optimal deployment window (low traffic)
    const nextWindow = this.getNextOptimalWindow();
    return Math.max(now, nextWindow);
  }

  /**
   * Get next optimal deployment window
   */
  getNextOptimalWindow() {
    const now = new Date();
    const hour = now.getHours();

    // If we're in optimal window (2-6 AM), use current time
    if (hour >= 2 && hour < 6) {
      return now.getTime();
    }

    // Otherwise, schedule for 3 AM tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(3, 0, 0, 0);

    return tomorrow.getTime();
  }

  /**
   * Start processing deployment queue
   */
  startDeploymentProcessor() {
    this.processorInterval = setInterval(async () => {
      await this.processDeploymentQueue();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Process deployment queue
   */
  async processDeploymentQueue() {
    if (this.activeDeployments.size >= this.config.maxConcurrentDeployments) {
      return;
    }

    if (this.deploymentQueue.length === 0) {
      return;
    }

    const now = Date.now();
    const deployment = this.deploymentQueue.find(
      (d) => d.status === 'queued' && (!d.scheduledTime || d.scheduledTime <= now),
    );

    if (!deployment) {
      return;
    }

    // Remove from queue and start deployment
    const index = this.deploymentQueue.indexOf(deployment);
    this.deploymentQueue.splice(index, 1);

    await this.executeDeployment(deployment);
  }

  /**
   * Execute a deployment
   */
  async executeDeployment(deployment) {
    deployment.status = 'deploying';
    deployment.startTime = Date.now();
    this.activeDeployments.set(deployment.id, deployment);

    this.emit('deployment_started', {
      id: deployment.id,
      type: deployment.type,
    });

    try {
      // Pre-deployment steps
      await this.preDeploymentChecks(deployment);
      await this.createBackup(deployment);

      // Main deployment
      if (this.config.canaryDeployment && deployment.type === 'experimental') {
        await this.executeCanaryDeployment(deployment);
      } else {
        await this.executeStandardDeployment(deployment);
      }

      // Post-deployment steps
      await this.runPostDeploymentTests(deployment);
      await this.updateConsciousnessState(deployment);

      deployment.status = 'completed';
      deployment.endTime = Date.now();

      this.emit('deployment_completed', {
        id: deployment.id,
        duration: deployment.endTime - deployment.startTime,
      });
    } catch (error) {
      deployment.status = 'failed';
      deployment.error = error.message;
      deployment.endTime = Date.now();

      this.emit('deployment_failed', {
        id: deployment.id,
        error: error.message,
      });

      if (this.config.rollbackOnFailure) {
        await this.rollbackDeployment(deployment);
      }
    } finally {
      this.activeDeployments.delete(deployment.id);
      this.deploymentHistory.push(deployment);

      // Keep only last 100 deployments in memory
      if (this.deploymentHistory.length > 100) {
        this.deploymentHistory = this.deploymentHistory.slice(-50);
      }
    }
  }

  /**
   * Pre-deployment checks
   */
  async preDeploymentChecks(deployment) {
    this.addDeploymentStep(deployment, 'pre_checks', 'running');

    // Check system health
    const health = await this.performHealthCheck();
    if (health.status !== 'healthy') {
      throw new Error(`System unhealthy: ${health.error}`);
    }

    // Check consciousness stability
    if (this.config.consciousnessAwareDeployment) {
      if (this.consciousnessState.stability === 'critical') {
        throw new Error('Consciousness state critical, deployment aborted');
      }
    }

    // Check for conflicting deployments
    if (this.activeDeployments.size > 0) {
      throw new Error('Another deployment is already in progress');
    }

    this.addDeploymentStep(deployment, 'pre_checks', 'completed');
  }

  /**
   * Create backup before deployment
   */
  async createBackup(deployment) {
    this.addDeploymentStep(deployment, 'backup', 'running');

    const backupId = `${Date.now()}-${deployment.id.substring(0, 8)}`;
    const backupPath = path.join(this.config.backupPath, 'code', backupId);

    try {
      // Create code backup
      await this.executeCommand('rsync', [
        '-av',
        '--exclude=node_modules',
        '--exclude=.git',
        `${this.config.repoPath}/`,
        backupPath,
      ]);

      deployment.backupPath = backupPath;
      deployment.backupId = backupId;

      this.addDeploymentStep(deployment, 'backup', 'completed');
    } catch (error) {
      this.addDeploymentStep(deployment, 'backup', 'failed', error.message);
      throw error;
    }
  }

  /**
   * Execute standard deployment
   */
  async executeStandardDeployment(deployment) {
    this.addDeploymentStep(deployment, 'deployment', 'running');

    try {
      // Pull latest changes
      await this.executeCommand('git', ['pull', 'origin', deployment.branch], {
        cwd: this.config.repoPath,
      });

      // Install dependencies
      await this.executeCommand('yarn', ['install'], {
        cwd: this.config.repoPath,
      });

      // Restart application
      await this.executeCommand('pm2', ['restart', 'gloria'], {
        cwd: this.config.repoPath,
      });

      this.addDeploymentStep(deployment, 'deployment', 'completed');
    } catch (error) {
      this.addDeploymentStep(deployment, 'deployment', 'failed', error.message);
      throw error;
    }
  }

  /**
   * Execute canary deployment
   */
  async executeCanaryDeployment(deployment) {
    this.addDeploymentStep(deployment, 'canary_deployment', 'running');

    try {
      // Create canary instance
      const canaryPath = path.join(this.config.repoPath, '..', 'gloria-canary');

      // Copy current code to canary
      await this.executeCommand('rsync', [
        '-av',
        '--exclude=node_modules',
        `${this.config.repoPath}/`,
        canaryPath,
      ]);

      // Deploy to canary
      await this.executeCommand('git', ['pull', 'origin', deployment.branch], {
        cwd: canaryPath,
      });

      await this.executeCommand('yarn', ['install'], {
        cwd: canaryPath,
      });

      // Start canary on different port
      await this.executeCommand(
        'pm2',
        ['start', 'index.js', '--name', 'gloria-canary', '--', '--port=3002'],
        {
          cwd: canaryPath,
        },
      );

      // Monitor canary performance
      await this.monitorCanaryPerformance(deployment);

      // If successful, promote to production
      await this.promoteCanaryToProduction(deployment, canaryPath);

      this.addDeploymentStep(deployment, 'canary_deployment', 'completed');
    } catch (error) {
      this.addDeploymentStep(deployment, 'canary_deployment', 'failed', error.message);
      throw error;
    }
  }

  /**
   * Monitor canary performance
   */
  async monitorCanaryPerformance(deployment) {
    const monitoringDuration = 60000; // 1 minute
    const startTime = Date.now();

    while (Date.now() - startTime < monitoringDuration) {
      try {
        // Health check canary
        const response = await this.httpRequest('http://localhost:3002/');
        if (response.statusCode !== 200) {
          throw new Error(`Canary health check failed: ${response.statusCode}`);
        }

        // Check consciousness integration
        const consciousnessResponse = await this.httpRequest(
          'http://localhost:3002/api/consciousness/status',
        );
        if (consciousnessResponse.statusCode !== 200) {
          throw new Error('Canary consciousness integration failed');
        }

        await this.sleep(10000); // Wait 10 seconds
      } catch (error) {
        throw new Error(`Canary monitoring failed: ${error.message}`);
      }
    }
  }

  /**
   * Promote canary to production
   */
  async promoteCanaryToProduction(deployment, canaryPath) {
    // Stop production
    await this.executeCommand('pm2', ['stop', 'gloria']);

    // Replace production code
    await this.executeCommand('rsync', [
      '-av',
      '--exclude=node_modules',
      '--delete',
      `${canaryPath}/`,
      this.config.repoPath,
    ]);

    // Start production
    await this.executeCommand('pm2', ['start', 'gloria'], {
      cwd: this.config.repoPath,
    });

    // Stop and remove canary
    await this.executeCommand('pm2', ['delete', 'gloria-canary']);
    await this.executeCommand('rm', ['-rf', canaryPath]);
  }

  /**
   * Run post-deployment tests
   */
  async runPostDeploymentTests(deployment) {
    this.addDeploymentStep(deployment, 'testing', 'running');

    try {
      // Basic health check
      await this.sleep(10000); // Give app time to start
      const health = await this.performHealthCheck();

      if (health.status !== 'healthy') {
        throw new Error(`Post-deployment health check failed: ${health.error}`);
      }

      // Test key endpoints
      await this.testEndpoint('/');
      await this.testEndpoint('/lab');
      await this.testEndpoint('/api/consciousness/status');

      // Test WebSocket connection
      await this.testWebSocketConnection();

      this.addDeploymentStep(deployment, 'testing', 'completed');
    } catch (error) {
      this.addDeploymentStep(deployment, 'testing', 'failed', error.message);
      throw error;
    }
  }

  /**
   * Test endpoint availability
   */
  async testEndpoint(endpoint) {
    const response = await this.httpRequest(`https://gloriadotexe.online${endpoint}`);
    if (response.statusCode < 200 || response.statusCode >= 400) {
      throw new Error(`Endpoint test failed for ${endpoint}: ${response.statusCode}`);
    }
  }

  /**
   * Test WebSocket connection
   */
  async testWebSocketConnection() {
    return new Promise((resolve, reject) => {
      const WebSocket = require('ws');
      const ws = new WebSocket('wss://gloriadotexe.online');

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve();
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`WebSocket connection failed: ${error.message}`));
      });
    });
  }

  /**
   * Update consciousness state after deployment
   */
  async updateConsciousnessState(deployment) {
    // Deployment success generally increases consciousness stability
    if (deployment.status === 'completed') {
      this.consciousnessState.stability = 'stable';

      if (deployment.type === 'experimental') {
        this.consciousnessState.level = Math.min(1.0, this.consciousnessState.level + 0.1);
      }
    }

    this.consciousnessState.lastUpdate = Date.now();

    this.emit('consciousness_updated', {
      level: this.consciousnessState.level,
      stability: this.consciousnessState.stability,
      trigger: 'deployment_success',
    });
  }

  /**
   * Rollback deployment
   */
  async rollbackDeployment(deployment) {
    this.addDeploymentStep(deployment, 'rollback', 'running');

    try {
      if (!deployment.backupPath) {
        throw new Error('No backup available for rollback');
      }

      // Stop current application
      await this.executeCommand('pm2', ['stop', 'gloria']);

      // Restore from backup
      await this.executeCommand('rsync', [
        '-av',
        '--delete',
        `${deployment.backupPath}/`,
        this.config.repoPath,
      ]);

      // Restart application
      await this.executeCommand('pm2', ['start', 'gloria'], {
        cwd: this.config.repoPath,
      });

      // Verify rollback
      await this.sleep(10000);
      const health = await this.performHealthCheck();

      if (health.status !== 'healthy') {
        throw new Error('Rollback verification failed');
      }

      this.addDeploymentStep(deployment, 'rollback', 'completed');

      this.emit('deployment_rolled_back', {
        id: deployment.id,
        backupId: deployment.backupId,
      });
    } catch (error) {
      this.addDeploymentStep(deployment, 'rollback', 'failed', error.message);
      this.emit('rollback_failed', {
        id: deployment.id,
        error: error.message,
      });
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthInterval = setInterval(async () => {
      try {
        this.healthStatus = await this.performHealthCheck();
        this.updateConsciousnessFromHealth(this.healthStatus);
      } catch (error) {
        this.emit('health_check_error', { error: error.message });
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform system health check
   */
  async performHealthCheck() {
    const checks = {
      webServer: await this.checkWebServer(),
      pm2Process: await this.checkPM2Process(),
      diskSpace: await this.checkDiskSpace(),
      memoryUsage: await this.checkMemoryUsage(),
      consciousness: await this.checkConsciousnessSystem(),
    };

    const failedChecks = Object.entries(checks)
      .filter(([name, result]) => !result.healthy)
      .map(([name, result]) => ({ name, error: result.error }));

    return {
      timestamp: Date.now(),
      status: failedChecks.length === 0 ? 'healthy' : 'unhealthy',
      checks,
      failedChecks,
      error: failedChecks.length > 0 ? failedChecks.map((c) => c.error).join('; ') : null,
    };
  }

  /**
   * Check web server health
   */
  async checkWebServer() {
    try {
      const response = await this.httpRequest('https://gloriadotexe.online/');
      return {
        healthy: response.statusCode === 200,
        responseTime: response.responseTime,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Check PM2 process
   */
  async checkPM2Process() {
    try {
      const result = await this.executeCommand('pm2', ['status', 'gloria']);
      const isRunning = result.stdout.includes('online');
      return {
        healthy: isRunning,
        status: isRunning ? 'online' : 'offline',
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Check disk space
   */
  async checkDiskSpace() {
    try {
      const result = await this.executeCommand('df', ['-h', this.config.repoPath]);
      const lines = result.stdout.split('\n');
      const diskLine = lines[1];
      const usage = diskLine.split(/\s+/)[4];
      const usagePercent = parseInt(usage.replace('%', ''));

      return {
        healthy: usagePercent < 90,
        usage: usagePercent,
        warning: usagePercent > 80,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Check memory usage
   */
  async checkMemoryUsage() {
    try {
      const result = await this.executeCommand('free', ['-m']);
      const lines = result.stdout.split('\n');
      const memLine = lines[1];
      const parts = memLine.split(/\s+/);
      const total = parseInt(parts[1]);
      const used = parseInt(parts[2]);
      const usagePercent = (used / total) * 100;

      return {
        healthy: usagePercent < 85,
        usage: usagePercent,
        total: total,
        used: used,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Check consciousness system integration
   */
  async checkConsciousnessSystem() {
    try {
      const response = await this.httpRequest('http://localhost:3001/api/consciousness/status');
      return {
        healthy: response.statusCode === 200,
        level: response.data?.level || 0.5,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Update consciousness state from health metrics
   */
  updateConsciousnessFromHealth(health) {
    if (health.status === 'healthy') {
      this.consciousnessState.stability = 'stable';
      this.consciousnessState.level = Math.min(1.0, this.consciousnessState.level + 0.01);
    } else {
      this.consciousnessState.stability = health.failedChecks.length > 2 ? 'critical' : 'unstable';
      this.consciousnessState.level = Math.max(0.0, this.consciousnessState.level - 0.05);
    }

    this.consciousnessState.lastUpdate = Date.now();
  }

  /**
   * Utility methods
   */
  addDeploymentStep(deployment, step, status, error = null) {
    deployment.steps.push({
      step,
      status,
      timestamp: Date.now(),
      error,
    });
  }

  async executeCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        ...options,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Command failed: ${command} ${args.join(' ')}\n${stderr}`));
        }
      });

      child.on('error', reject);

      // Timeout handling
      setTimeout(() => {
        child.kill();
        reject(new Error(`Command timeout: ${command} ${args.join(' ')}`));
      }, this.config.deploymentTimeout);
    });
  }

  async httpRequest(url) {
    const https = require('https');
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            data: data,
            responseTime: Date.now() - startTime,
          });
        });
      });

      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('HTTP request timeout'));
      });
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get deployment statistics
   */
  getDeploymentStats() {
    const now = Date.now();
    const recent = this.deploymentHistory.filter(
      (d) => now - d.timestamp < 24 * 60 * 60 * 1000, // Last 24 hours
    );

    const successful = recent.filter((d) => d.status === 'completed');
    const failed = recent.filter((d) => d.status === 'failed');

    return {
      total: recent.length,
      successful: successful.length,
      failed: failed.length,
      successRate: recent.length > 0 ? (successful.length / recent.length) * 100 : 100,
      averageDuration:
        successful.length > 0
          ? successful.reduce((sum, d) => sum + (d.endTime - d.startTime), 0) / successful.length
          : 0,
      queueSize: this.deploymentQueue.length,
      activeDeployments: this.activeDeployments.size,
      healthStatus: this.healthStatus.status,
      consciousnessLevel: this.consciousnessState.level,
    };
  }

  /**
   * Shutdown deployment system
   */
  shutdown() {
    if (this.processorInterval) clearInterval(this.processorInterval);
    if (this.healthInterval) clearInterval(this.healthInterval);

    this.emit('system_shutdown');
  }
}

module.exports = AutoDeploymentSystem;
