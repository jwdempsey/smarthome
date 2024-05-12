const BaseSubscriber = require("../BaseSubscriber");
const dorita = require("dorita980");
const HTTPError = require("../../HTTPError");

class iRobotClient extends BaseSubscriber {
    constructor() {
      const manufacturer = "iRobot";
      const schema = {
        item: {
          name: "name",
          key: "mac",
          model: "sku",
          properties: "properties",
          commands: "commands"
        },
        each: (item) => {
          return (item = Object.assign(item, {
            manufacturer: manufacturer,
            type: "vacuum",
          }));
        }
      };
      super(manufacturer, schema);

      if (!process.env.IROBOT_BLID || !process.env.IROBOT_PASSWORD) {
        this.canLogin = false;
        return;
      }
    };

    async login() {
      if (!this.localIp) {
        await new Promise((resolve, reject) => {
          dorita.getRobotIP((_, ip) => {
            this.localIp = ip;
            resolve();
          });
        });
      }
      
      if (!this.client) {
        this.client = new dorita.Local(process.env.IROBOT_BLID, process.env.IROBOT_PASSWORD, this.localIp, 2);
      }
    }

    async get(req) {
      await this.login();
      const devices = await this.client.getRobotState(['name', 'sku', 'mac']);
      return [devices];
    }

    async getById(req) {
      const device = await this.get(req);
      let copy = Object.assign(device[0], { properties: {} }, { commands: ["turn"] });
      copy.properties["powerState"] = copy.dock.known ? "on" : "off";
      return copy;
    }
  
    async post(req) {
      if (this.canLogin) {
        let response = "";
        switch (req.body.command) {
          case "power":
            if (!req.body.value) {
              await this.client.stop();
              await this.client.dock();
              response = "docking";
            } else {
              await this.client.clean();
              response = "starting";
            }
            return { message: response };
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

module.exports = new iRobotClient();