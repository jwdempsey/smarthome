const fs = require('fs');
const path = require('path');

const tokenFilePath = path.join(__dirname, 'tokens.json');

class TokenManager {
  static saveTokens(tokens) {
    fs.writeFileSync(tokenFilePath, JSON.stringify(tokens, null, 2));
  }

  static getTokens() {
    try {
      if (!fs.existsSync(tokenFilePath)) {
        console.log('Token file does not exist. Creating a new one.');
        fs.writeFileSync(tokenFilePath, '{}');
        return {};
      }

      const tokens = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
      return tokens;
    } catch (error) {
      console.error('Error reading tokens:', error);
      return null;
    }
  }
}

module.exports = TokenManager;