module.exports = class BaseSubscriber {
  constructor(manufacturer, schema) {
    this.manufacturer = manufacturer.toLowerCase();
    this.schema = schema;
  }

  shouldProcess(manufacturer) {
    return manufacturer === "all" || manufacturer === this.manufacturer;
  }

  async get(req) {
    return req;
  }

  async getById(req) {
    return req;
  }

  async post(req) {
    return req;
  }
};
