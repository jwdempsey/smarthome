const BaseSubscriber = require("../BaseSubscriber");
const Govee = require("node-govee-led");

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

    this.govee = new Govee({
      apiKey: process.env.GOVEE_API_KEY,
      mac: "",
      model: "",
    });
  }

  client(mac = "", model = "") {
    return Object.assign(this.govee, { mac: mac, model: model });
  }

  async get(req) {
    const devices = await this.client().getDevices();
    return devices.devices;
  }

  async getById(req) {
    // Get device with the passed in key
    const devices = await this.get(req);
    let device = devices.find((d) => d.device === req.params.key);

    // Get current state of device
    const state = await this.client(device.device, device.model).getState();

    return Object.assign(device, { properties: state.data.properties });
  }

  async post(req) {
    const client = this.client(req.body.key, req.body.model);
    switch (req.body.command) {
      case "power":
        if (!req.body.value) {
          return await client.turnOff();
        } else {
          return await client.turnOn();
        }
      case "brightness":
        return await client.setBrightness(parseInt(req.body.value));
      case "color":
        return await client.setColor(req.body.value);
      default:
        throw new Error(`${req.body.command} is not supported`);
    }
  }
}

module.exports = new GoveeClient();
