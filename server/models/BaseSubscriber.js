module.exports = class BaseSubscriber {
  constructor(manufacturer, schema) {
    this.manufacturer = manufacturer.toLowerCase();
    this.schema = schema;
    this.canLogin = true;
  }

  shouldProcess(manufacturer) {
    return (
      (this.canLogin && manufacturer === 'all') ||
      manufacturer === this.manufacturer
    );
  }

  async get() {
    return {};
  }

  async getById(req) {
    return req;
  }

  async post(req) {
    return req;
  }
};
