/**
 * Environment Variable Validation
 * Ensures required environment variables are present and valid at startup
 */

const requiredEnvVars = [
  'PORT',
  'TUMBLR_CLIENT_ID', 
  'TUMBLR_CLIENT_SECRET',
  'REDIRECT_URI'
];

const optionalEnvVars = [
  'POLLINATIONS_AUTH'
];

function validateEnvironment() {
  const missing = [];
  const warnings = [];
  
  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  // Check optional but recommended variables
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }
  
  // Validate PORT is a valid number
  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    missing.push('PORT (must be a valid number)');
  }
  
  // Validate URLs
  if (process.env.REDIRECT_URI && !isValidUrl(process.env.REDIRECT_URI)) {
    missing.push('REDIRECT_URI (must be a valid URL)');
  }
  
  // Report results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n💡 Copy .env.example to .env and fill in your values');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:');
    warnings.forEach(varName => console.warn(`   - ${varName}`));
  }
  
  console.log('✓ Environment variables validated successfully');
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = { validateEnvironment };