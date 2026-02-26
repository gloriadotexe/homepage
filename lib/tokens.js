const fs = require('fs');
const path = require('path');

const TOKEN_FILE = path.join(__dirname, '..', 'tokens.json');

function loadTokens() {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

const tokenStore = loadTokens();

module.exports = { tokenStore, saveTokens };
