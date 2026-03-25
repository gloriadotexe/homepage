#!/usr/bin/env node
const https = require('https');
const config = JSON.parse(require('fs').readFileSync('monitoring/config/monitoring-config.json'));

console.log('🔍 Running quality assurance check...');

async function checkEndpoint(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    https
      .get(url, (res) => {
        const duration = Date.now() - start;
        resolve({
          url: url,
          status: res.statusCode,
          duration: duration,
          success: res.statusCode === 200,
        });
      })
      .on('error', (error) => {
        resolve({
          url: url,
          status: 0,
          duration: -1,
          success: false,
          error: error.message,
        });
      });
  });
}

async function runChecks() {
  const results = [];

  // Test all endpoints
  for (const endpoint of config.site.endpoints) {
    const result = await checkEndpoint(config.site.url + endpoint);
    results.push(result);
  }

  for (const endpoint of config.site.api_endpoints) {
    const result = await checkEndpoint(config.site.url + endpoint);
    results.push(result);
  }

  // Test .well-known files
  const wellKnownFiles = [
    '/.well-known/security.txt',
    '/.well-known/humans.txt',
    '/.well-known/robots.txt',
  ];
  for (const file of wellKnownFiles) {
    const result = await checkEndpoint(config.site.url + file);
    results.push(result);
  }

  const report = {
    timestamp: new Date().toISOString(),
    check_type: 'quality',
    results: results,
    summary: {
      total_checks: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      avg_response_time:
        results.filter((r) => r.duration > 0).reduce((a, b) => a + b.duration, 0) /
          results.filter((r) => r.duration > 0).length || 0,
    },
  };

  console.log(JSON.stringify(report, null, 2));

  const failureRate = report.summary.failed / report.summary.total_checks;
  if (failureRate > 0.2) {
    console.log('❌ High failure rate detected');
    process.exit(1);
  } else if (report.summary.failed > 0) {
    console.log('⚠️  Some endpoints failing');
    process.exit(2);
  } else {
    console.log('✅ All quality checks passed');
    process.exit(0);
  }
}

runChecks().catch(console.error);
