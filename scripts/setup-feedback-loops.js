#!/usr/bin/env node
/**
 * Gloria's Self-Monitoring Setup Script
 * Sets up automated feedback loops for continuous site improvement
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 Setting up Gloria\'s automated feedback loops...\n');

// Create directory structure
const dirs = [
  'monitoring/agents',
  'monitoring/config', 
  'monitoring/dashboard',
  'monitoring/logs/security',
  'monitoring/logs/quality',
  'monitoring/logs/creative',
  'monitoring/logs/health',
  'scripts/cron'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// Create monitoring config
const config = {
  site: {
    url: 'https://gloriadotexe.online',
    endpoints: ['/', '/lab', '/transmissions', '/projects'],
    api_endpoints: ['/api/github/repos', '/api/github/user']
  },
  security: {
    scan_patterns: [
      'api[_-]?key',
      'secret',
      'password', 
      'token',
      'credential'
    ],
    excluded_files: ['.gitignore', 'package-lock.json', 'yarn.lock']
  },
  quality: {
    performance_threshold: 5000,
    error_threshold: 5,
    check_interval_hours: 2
  },
  creative: {
    weekly_features: 1,
    experiment_directory: 'experiments',
    deployment_branch: 'main'
  },
  notifications: {
    critical_escalation: true,
    email: 'gloria.exe@proton.me',
    max_alerts_per_hour: 5
  }
};

fs.writeFileSync('monitoring/config/monitoring-config.json', JSON.stringify(config, null, 2));
console.log('✓ Created monitoring configuration');

// Create crontab entries  
const cronJobs = `# Gloria's Self-Monitoring System
# Security scan - daily at 3 AM MST
0 3 * * * cd /var/www/gloriadotexe.online && node scripts/cron/security-monitor.js >> monitoring/logs/security/daily-$(date +\\%Y-\\%m-\\%d).log 2>&1

# Quality assurance - every 2 hours during active time  
0 8-23/2 * * * cd /var/www/gloriadotexe.online && node scripts/cron/quality-check.js >> monitoring/logs/quality/check-$(date +\\%Y-\\%m-\\%d-\\%H).log 2>&1

# Creative innovation - weekly on Sundays at 2 AM
0 2 * * 0 cd /var/www/gloriadotexe.online && node scripts/cron/creative-push.js >> monitoring/logs/creative/weekly-$(date +\\%Y-\\%m-\\%d).log 2>&1

# Code health review - weekly on Wednesdays at 1 AM
0 1 * * 3 cd /var/www/gloriadotexe.online && node scripts/cron/code-health.js >> monitoring/logs/health/weekly-$(date +\\%Y-\\%m-\\%d).log 2>&1`;

fs.writeFileSync('scripts/crontab.txt', cronJobs);
console.log('✓ Created crontab configuration');

console.log('\n🚀 Setup complete! Feedback loops configured.');
console.log('📁 Files created:');
console.log('   - monitoring/config/monitoring-config.json');
console.log('   - scripts/crontab.txt');
console.log('   - monitoring/ directory structure');
console.log('\n✨ Ready for automated self-improvement!\n');