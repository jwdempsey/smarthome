const BaseSubscriber = require('../../models/BaseSubscriber');
const HTTPError = require('../../models/HTTPError.js');
const { login } = require('tplink-cloud-api');

class KasaClient extends BaseSubscriber {
  constructor() {
    const manufacturer = 'kasa';
    const schema = {
      item: {
        name: 'alias',
        key: 'deviceId',
        model: 'deviceModel',
        properties: 'properties',
        type: 'deviceType',
        commands: 'commands',
        message: 'message',
      },
      each: (item) => {
        let type = item.type ? item.type.toLowerCase() : '';
        if (type.endsWith('smartbulb')) {
          type = 'light';
        } else if (type.endsWith('smartplug')) {
          type = 'plug';
        } else if (type.endsWith('smartplugswitch')) {
          type = 'switch';
        }
        return (item = Object.assign(item, {
          manufacturer: manufacturer,
          type: type,
        }));
      },
    };

    super(manufacturer, schema);

    if (!process.env.KASA_EMAIL || !process.env.KASA_PASSWORD) {
      this.canLogin = false;
    }
  }

  async login() {
    if (!this.client) {
      await login(process.env.KASA_EMAIL, process.env.KASA_PASSWORD)
        .then((response) => {
          this.client = response;
        })
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
      const deviceList = await this.client.getDeviceList();
      return deviceList.filter((device) => filters.every((f) => f(device)));
    }
    return [];
  }

  async get() {
    const filters = [
      (device) => device.status > 0,
      (device) => device.deviceType !== 'HOMEWIFISYSTEM',
    ];

    return await this.getDevices(filters);
  }

  async getById(req) {
    // Get device with the passed in deviceId
    const devices = await this.getDevices([
      (d) => d.deviceId === req.params.key,
    ]);

    // Create an object based on the type of device and get it's current state
    const newDevice = this.client.newDevice(devices[0].alias);
    const metadata = await newDevice.getSysInfo();
    let device = Object.assign(
      newDevice.device,
      { properties: {} },
      { commands: [] }
    );

    // Let's determine what functionality this device has
    if (Object.prototype.hasOwnProperty.call(metadata, 'relay_state')) {
      device.commands.push('turn');
      device.properties['powerState'] =
        metadata.relay_state === 1 ? 'on' : 'off';
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'brightness')) {
      device.commands.push('brightness');
      device.properties['brightness'] = metadata.brightness;
    }

    return device;
  }

  async post(req) {
    if (this.canLogin) {
      const device = this.client.newDevice(req.body.name);
      let response = '';

      switch (req.body.command) {
        case 'power':
          if (!req.body.value) {
            response = await device.powerOff();
            return { message: this.getResponse(req.body.command, response) };
          } else {
            response = await device.powerOn();
            return { message: this.getResponse(req.body.command, response) };
          }
        case 'brightness':
          // API does not allow a brightness level of 0
          response = await device.setBrightness(req.body.value == 0 ? 1 : parseInt(req.body.value));
          return { message: this.getResponse(req.body.command, response) };
        default:
          throw new HTTPError(
            `${req.body.command} is not supported`,
            HTTPError.BadRequest
          );
      }
    }

    throw new HTTPError('Not Authorized', HTTPError.Unauthorized);
  }

  getResponse(command, response) {
    if (command === 'power') {
      if (response.system.set_relay_state.err_code == 0) {
        return 'Success';
      }
    } else if (command === 'brightness') {
      for (const [, value] of Object.entries(response)) {
        if (
          Object.prototype.hasOwnProperty.call(value, 'set_brightness') &&
          Object.prototype.hasOwnProperty.call(value.set_brightness, 'err_code') &&
          value.set_brightness.err_code == 0
        ) {
          return 'Success';
        }
      }
    }

    throw new HTTPError(`Setting the ${command} failed`, HTTPError.BadRequest);
  }
}

module.exports = new KasaClient();
