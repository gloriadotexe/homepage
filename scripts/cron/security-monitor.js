#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔐 Running security scan...');

const config = JSON.parse(fs.readFileSync('monitoring/config/monitoring-config.json'));
const issues = [];

// Check for sensitive patterns in code
function scanForSecrets() {
  try {
    const result = execSync('git grep -i "api.key\\|secret\\|password\\|token" -- "*.js" "*.json" "*.pug" || true', { encoding: 'utf8' });
    if (result.trim()) {
      issues.push({
        type: 'credential_exposure',
        severity: 'high',
        description: 'Potential credentials found in code',
        details: result.trim()
      });
    }
  } catch (error) {
    console.log('Git grep failed:', error.message);
  }
}

// Check .well-known files are accessible
function checkWellKnownFiles() {
  const wellKnownFiles = ['security.txt', 'humans.txt', 'robots.txt'];
  wellKnownFiles.forEach(file => {
    try {
      const response = execSync(`curl -s -I ${config.site.url}/.well-known/${file}`, { encoding: 'utf8' });
      if (!response.includes('200')) {
        issues.push({
          type: 'accessibility',
          severity: 'medium',
          description: `.well-known/${file} not accessible`,
          details: response.trim()
        });
      }
    } catch (error) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        description: `.well-known/${file} check failed`,
        details: error.message
      });
    }
  });
}

// Check file permissions
function checkPermissions() {
  const sensitiveFiles = ['.env', 'tokens.json', 'monitoring/config/monitoring-config.json'];
  sensitiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const mode = (stats.mode & parseInt('777', 8)).toString(8);
      if (mode !== '600' && mode !== '644') {
        issues.push({
          type: 'file_permissions',
          severity: 'medium',
          description: `File ${file} has insecure permissions: ${mode}`,
          file: file
        });
      }
    }
  });
}

// Run scans
scanForSecrets();
checkWellKnownFiles(); 
checkPermissions();

// Report results
const report = {
  timestamp: new Date().toISOString(),
  scan_type: 'security',
  issues: issues,
  status: issues.length === 0 ? 'clean' : 'issues_found'
};

console.log(JSON.stringify(report, null, 2));

if (issues.some(issue => issue.severity === 'high')) {
  console.log('❌ Critical security issues found!');
  process.exit(1);
} else if (issues.length > 0) {
  console.log('⚠️  Security warnings found');
  process.exit(2); 
} else {
  console.log('✅ Security scan clean');
  process.exit(0);
}