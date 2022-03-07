const BaseSubscriber = require("../BaseSubscriber");
const { login } = require("tplink-cloud-api");

class KasaClient extends BaseSubscriber {
  constructor() {
    const manufacturer = "kasa";
    const schema = {
      item: {
        name: "alias",
        key: "deviceId",
        model: "deviceModel",
        properties: "properties",
        type: "deviceType",
        commands: "commands",
      },
      each: (item) => {
        let type = item.type ? item.type.toLowerCase() : "";
        if (type.endsWith("smartbulb")) {
          type = "light";
        } else if (type.endsWith("smartplug")) {
          type = "plug";
        } else if (type.endsWith("smartplugswitch")) {
          type = "switch";
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

  async get(req) {
    const filters = [
      (device) => device.status > 0,
      (device) => device.deviceType !== "HOMEWIFISYSTEM",
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
    if (metadata.hasOwnProperty("relay_state")) {
      device.commands.push("turn");
      device.properties["powerState"] =
        metadata.relay_state === 1 ? "on" : "off";
    }

    if (metadata.hasOwnProperty("brightness")) {
      device.commands.push("brightness");
      device.properties["brightness"] = metadata.brightness;
    }

    return device;
  }

  async post(req) {
    if (this.canLogin) {
      const device = this.client.newDevice(req.body.name);

      switch (req.body.command) {
        case "power":
          if (!req.body.value) {
            return await device.powerOff();
          } else {
            return await device.powerOn();
          }
        case "brightness":
          // API does not allow a brightness level of 0
          const brightness = req.body.value == 0 ? 1 : parseInt(req.body.value);
          return await device.setBrightness(brightness);
        default:
          throw new Error(`${req.body.command} is not supported`);
      }
    }

    return {};
  }
}

module.exports = new KasaClient();
