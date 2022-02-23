const BaseSubscriber = require("../BaseSubscriber");
const Client = require("node-vesync");

class VesyncClient extends BaseSubscriber {
  constructor() {
    const manufacturer = "vesync";
    const schema = {
      item: {
        name: "deviceName",
        key: "uuid",
        model: "deviceType",
        properties: "properties",
        commands: "commands",
      },
      each: (item) => {
        return (item = Object.assign(item, {
          manufacturer: manufacturer,
          type: "light",
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
      this.client = new Client();
      await this.client.login(
        process.env.VESYNC_EMAIL,
        process.env.VESYNC_PASSWORD
      );
    }

    return this.client;
  }

  async getDevices(filters = []) {
    await this.login();
    const deviceList = await this.client.getDevices();
    return deviceList.filter((device) => filters.every((f) => f(device)));
  }

  async get(req) {
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
    if (metadata.hasOwnProperty("deviceStatus")) {
      device.commands.push("turn");
      device.properties["powerState"] = metadata.deviceStatus;
    }

    if (metadata.hasOwnProperty("brightNess")) {
      device.commands.push("brightness");
      device.properties["brightness"] = metadata.brightNess;
    }

    return device;
  }

  async post(req) {
    const devices = await this.getDevices([(d) => d.uuid === req.body.key]);

    switch (req.body.command) {
      case "power":
        return await this.client.toggle(devices[0], req.body.value);
      case "brightness":
        return await this.client.setBrightness(devices[0], req.body.value);
      default:
        throw new Error(`${req.body.command} is not supported`);
    }
  }
}

module.exports = new VesyncClient();
