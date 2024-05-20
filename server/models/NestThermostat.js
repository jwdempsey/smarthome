const { OAuth2Client } = require('google-auth-library');
const TokenManager = require('./TokenManager');

class NestThermostat {
  constructor() {
    this.tokens = TokenManager.getTokens();
    this.clientId = process.env.NEST_CLIENT_ID;
    this.clientSecret = process.env.NEST_CLIENT_SECRET;
    this.redirectUri = 'http://localhost:3000/oauth2callback';
    this.oAuth2Client = new OAuth2Client(this.clientId, this.clientSecret, this.redirectUri);
  }

  async getTokens(code) {
    const { tokens } = await this.oAuth2Client.getToken(code);
    this.setTokens(tokens);
  }

  setTokens(tokens) {
    this.tokens = tokens;
    TokenManager.saveTokens(tokens);
    this.oAuth2Client.setCredentials(tokens);
  }

  async refreshAccessToken() {
    this.oAuth2Client.setCredentials(this.tokens);
    const { credentials } = await this.oAuth2Client.refreshAccessToken();
    this.setTokens(credentials);
    return credentials;
  }

  async getAccessToken() {
    if (!this.tokens || !this.tokens.access_token) {
      await this.getTokens(process.env.NEST_AUTH_CODE);
    }

    if (this.isTokenExpired()) {
      const newTokens = await this.refreshAccessToken();
      return newTokens.access_token;
    }

    return this.tokens.access_token;
  }

  isTokenExpired() {
    const now = Date.now();
    const expiryDate = this.tokens.expiry_date;
    return now >= expiryDate;
  }

  async makeApiRequest(url, method = 'GET', body = null) {
    const accessToken = await this.getAccessToken();
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Failed to make API request: ${response.statusText}`);
    }
    return await response.json();
  }

  async getDevices() {
    const url = `https://smartdevicemanagement.googleapis.com/v1/enterprises/${process.env.NEST_PROJECT_ID}/devices`;
    return await this.makeApiRequest(url);
  }

  async setPower(power) {
    return power;
  }

  async setMode(id, mode) {
    const url = `https://smartdevicemanagement.googleapis.com/v1/${id}:executeCommand`;
    const body = {
      command: 'sdm.devices.commands.ThermostatMode.SetMode',
      params: { mode }
    };
    return await this.makeApiRequest(url, 'POST', body);
  }

  async setTemperature(id, command, param, temperature) {
    const url = `https://smartdevicemanagement.googleapis.com/v1/${id}:executeCommand`;
    const celsius = (temperature - 32) / 9 * 5;
    const body = {
      command: `sdm.devices.commands.ThermostatTemperatureSetpoint.${command}`,
      params: { [param]: celsius }
    };
    return await this.makeApiRequest(url, 'POST', body);
  }

  async setTemperatureDynamically(thermostatMode, id, temperature) {
    const mode = thermostatMode.toLowerCase();
    const temp = parseInt(temperature, 10);
    if (mode === 'cool') {
      return await this.setTemperature(id, 'SetCool', 'coolCelsius', temp);
    } else if (mode === 'heat') {
      return await this.setTemperature(id, 'SetHeat', 'heatCelsius', temp);
    } else {
      throw new Error(`${thermostatMode} is not supported at this time`);
    }
  }

  async setOffMode(id) {
    return await this.setMode(id, 'OFF');
  }

  async setCoolMode(id) {
    return await this.setMode(id, 'COOL');
  }

  async setHeatMode(id) {
    return await this.setMode(id, 'HEAT');
  }

  async setHeatCoolMode(id) {
    return await this.setMode(id, 'HEATCOOL');
  }
}

module.exports = NestThermostat;
