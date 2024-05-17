const BaseSubscriber = require('../../models/BaseSubscriber');
const Vesync = require('node-vesync');
const HTTPError = require('../../models/HTTPError.js');

class VesyncClient extends BaseSubscriber {
  constructor() {
    const manufacturer = 'vesync';
    const schema = {
      item: {
        name: 'deviceName',
        key: 'uuid',
        model: 'deviceType',
        properties: 'properties',
        commands: 'commands',
        message: 'message',
      },
      each: (item) => {
        return (item = Object.assign(item, {
          manufacturer: manufacturer,
          type: 'light',
        }));
      },
    };

    super(manufacturer, schema);

    if (!process.env.VESYNC_EMAIL || !process.env.VESYNC_PASSWORD) {
      this.canLogin = false;
    }
  }

  async login() {
    if (!this.client) {
      this.client = new Vesync();
      await this.client
        .login(process.env.VESYNC_EMAIL, process.env.VESYNC_PASSWORD)
        .catch(() => {
          this.canLogin = false;
          this.client = null;
        });
    }

    return this.client;
  }

  async getDevices(filters = []) {
    await this.login();

    if (this.canLogin) {
      const deviceList = await this.client.getDevices();
      return deviceList.filter((device) => filters.every((f) => f(device)));
    }

    return [];
  }

  async get() {
    return await this.getDevices();
  }

  async getById(req) {
    const devices = await this.getDevices([(d) => d.uuid === req.params.key]);
    let device = Object.assign(
      devices[0],
      { properties: {} },
      { commands: [] }
    );
    const metadata = await this.client.getDeviceDetails(devices[0]);

    // Let's determine what functionality this device has
    if (Object.prototype.hasOwnProperty.call(metadata, 'deviceStatus')) {
      device.commands.push('turn');
      device.properties['powerState'] = metadata.deviceStatus;
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'brightNess')) {
      device.commands.push('brightness');
      device.properties['brightness'] = metadata.brightNess;
    }

    return device;
  }

  async post(req) {
    if (this.canLogin) {
      const devices = await this.getDevices([(d) => d.uuid === req.body.key]);
      let response = '';

      switch (req.body.command) {
        case 'power':
          response = await this.client.toggle(devices[0], req.body.value);
          return { message: response.data.msg };
        case 'brightness':
          response = await this.client.setBrightness(
            devices[0],
            req.body.value
          );
          return { message: response.data.msg };
        default:
          throw new HTTPError(
            `Setting the ${req.body.command} failed`,
            HTTPError.BadRequest
          );
      }
    }

    throw new HTTPError('Not Authorized', HTTPError.Unauthorized);
  }
}

module.exports = new VesyncClient();
