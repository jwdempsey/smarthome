const BaseSubscriber = require('../../models/BaseSubscriber');
const HTTPError = require('../../models/HTTPError');
const NestThermostat = require('../../models/NestThermostat');

class NestClient extends BaseSubscriber {
  constructor() {
    const manufacturer = 'nest';
    super(manufacturer, {
      item: {
        name: 'name',
        key: 'key',
        model: 'model',
        properties: 'properties',
        commands: 'commands'
      },
      each: (item) => {
        return (item = Object.assign(item, {
          manufacturer: manufacturer,
          type: 'thermometer',
        }));
      }
    });

    this.canLogin = process.env.NEST_PROJECT_ID && process.env.NEST_CLIENT_ID && process.env.NEST_CLIENT_SECRET && process.env.NEST_AUTH_CODE
    this.client = null;
  }

  async login() {
    if (!this.client) {
      this.client = new NestThermostat();
    }
  }

  async get(filters = []) {
    await this.login();
    const nestDevices = (await this.client.getDevices()).devices;

    const devices = nestDevices.map(device => ({
      name: device.parentRelations[0].displayName,
      key: device.name,
      model: device.type,
      properties: {
        online: device.traits['sdm.devices.traits.Connectivity'].status === 'ONLINE',
        powerState: device.traits['sdm.devices.traits.ThermostatMode'].mode,
        brightness: this.celsiusToFahrenheit(device.traits['sdm.devices.traits.Temperature'].ambientTemperatureCelsius)
      },
      commands: [
        { slider: 'temperature' },
        { button: 'cool' },
        { button: 'heat' }
      ]
    }));

    return devices.filter(device => filters.every(filter => filter(device)));
  }

  async getById(req) {
    return await this.get([
      (d) => d.key === req.params.key,
    ]);
  }

  async post(req) {
    if (!this.canLogin) {
      throw new HTTPError('Not Authorized', HTTPError.Unauthorized);
    }

    const { command, value, key, properties } = req.body;
    const commands = {
      power: () => value ? this.client.setHeatCoolMode(key) : this.client.setOffMode(key),
      temperature: () => this.client.setTemperatureDynamically(properties.powerState, key, value),
      cool: () => this.client.setCoolMode(key),
      heat: () => this.client.setHeatMode(key),
    };

    if (commands[command]) {
      return { message: await commands[command]() };
    }

    throw new HTTPError(`${command} is not supported`, HTTPError.BadRequest);
  }

  celsiusToFahrenheit(celsius) {
    return Math.floor((celsius * 9 / 5) + 32);
  }
}

module.exports = new NestClient();