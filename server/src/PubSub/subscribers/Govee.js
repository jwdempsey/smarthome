const BaseSubscriber = require("../BaseSubscriber");
const Govee = require("node-govee-led");
const HTTPError = require("../../HTTPError");

class GoveeClient extends BaseSubscriber {
  constructor() {
    const manufacturer = "govee";
    const schema = {
      item: {
        name: "deviceName",
        key: "device",
        model: "model",
        commands: "supportCmds",
        properties: "properties",
        message: "message",
      },
      each: (item) => {
        let properties = item.properties;
        if (Array.isArray(item.properties)) {
          properties = Object.assign(...item.properties);
        }

        return (item = Object.assign(item, {
          manufacturer: manufacturer,
          type: "light",
          properties: properties,
        }));
      },
    };

    super(manufacturer, schema);

    if (!process.env.GOVEE_API_KEY) {
      this.canLogin = false;
    }
  }

  login(mac = "", model = "") {
    this.client = new Govee({
      apiKey: process.env.GOVEE_API_KEY,
      mac: mac,
      model: model,
    });

    return this.client;
  }

  async getDevices(filters = []) {
    let devices = [];

    if (this.canLogin) {
      this.login();

      await this.client
        .getDevices()
        .then((deviceList) => {
          devices = deviceList.devices.filter((device) =>
            filters.every((f) => f(device))
          );
        })
        .catch(() => {
          return devices;
        });
    }

    return devices;
  }

  async get(req) {
    return await this.getDevices();
  }

  async getById(req) {
    // Get device with the passed in key
    const devices = await this.getDevices([(d) => d.device === req.params.key]);
    const device = devices[0];

    // Get current state of device
    const state = await this.login(device.device, device.model).getState();

    return Object.assign(device, { properties: state.data.properties });
  }

  async post(req) {
    if (this.canLogin) {
      const client = this.login(req.body.key, req.body.model);
      let response = "";

      switch (req.body.command) {
        case "power":
          if (!req.body.value) {
            response = await client.turnOff();
            return { message: response.message };
          } else {
            response = await client.turnOn();
            return { message: response.message };
          }
        case "brightness":
          response = await client.setBrightness(parseInt(req.body.value));
          return { message: response.message };
        case "color":
          response = await client.setColor(req.body.value);
          return { message: response.message };
        default:
          throw new HTTPError(
            `${req.body.command} is not supported`,
            HTTPError.BadRequest
          );
      }
    }

    throw new HTTPError(`Not Authorized`, HTTPError.Unauthorized);
  }
}

module.exports = new GoveeClient();
