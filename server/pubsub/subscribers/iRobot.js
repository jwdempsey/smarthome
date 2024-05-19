const BaseSubscriber = require('../../models/BaseSubscriber');
const HTTPError = require('../../models/HTTPError');
const dorita = require('dorita980');

class iRobotClient extends BaseSubscriber {
  constructor() {
    const manufacturer = 'iRobot';
    super(manufacturer, {
      item: {
        name: 'name',
        key: 'mac',
        model: 'sku',
        properties: 'properties',
        commands: 'commands'
      },
      each: (item) => {
        return (item = Object.assign(item, {
          manufacturer: manufacturer,
          type: 'vacuum',
        }));
      }
    });

    this.canLogin = process.env.IROBOT_BLID && process.env.IROBOT_PASSWORD;
    this.localIp = null;
    this.client = null;
  }

  async login() {
    if (!this.localIp) {
      this.localIp = await new Promise((resolve, reject) => {
        dorita.getRobotIP((err, ip) => (err ? reject(err) : resolve(ip)));
      });
    }

    if (!this.client) {
      this.client = new dorita.Local(
        process.env.IROBOT_BLID,
        process.env.IROBOT_PASSWORD,
        this.localIp,
        2
      );
    }
  }

  async get() {
    await this.login();
    const devices = await this.client.getRobotState(['name', 'sku', 'mac']);
    return [devices];
  }

  async getById(req) {
    const device = (await this.get(req))[0];
    return {
      ...device,
      properties: { powerState: device.dock.known ? 'off' : 'on' },
      commands: [{ 'button': 'start' }, { 'button': 'pause' }, { 'button': 'dock' }]
    };
  }

  async post(req) {
    if (!this.canLogin) {
      throw new HTTPError('Not Authorized', HTTPError.Unauthorized);
    }

    const { command, value } = req.body;
    const commands = {
      power: () => (value ? this.startCleaning() : this.docking()),
      start: () => (this.startCleaning()),
      pause: () => (this.pauseCleaning()),
      dock: () => (this.docking())
    };

    if (commands[command]) {
      return { message: await commands[command]() };
    }

    throw new HTTPError(`${command} is not supported`, HTTPError.BadRequest);
  }

  async startCleaning() {
    await this.client.clean();
    return 'starting';
  }

  async stopCleaning() {
    await this.client.stop();
    return 'stopping';
  }

  async pauseCleaning() {
    await this.client.pause();
    return 'pausing';
  }

  async docking() {
    await this.stopCleaning();
    await this.client.dock();
    return 'docking';
  }
}

module.exports = new iRobotClient();
