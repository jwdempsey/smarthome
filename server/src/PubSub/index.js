const { listeners } = require("./subscribers");
const { transform } = require("node-json-transform");

class PubSub {
  constructor() {
    this.listeners = {
      get: new Array(),
      getById: new Array(),
      post: new Array(),
    };

    this.subscribeAll();
  }

  getManufacturer(payload) {
    return (
      payload.params.manufacturer ||
      payload.body.manufacturer ||
      payload.query.manufacturer ||
      "all"
    );
  }

  subscribeAll() {
    listeners.forEach((listener) => {
      let options = {
        shouldProcess: (topic, req) => listener.shouldProcess(topic, req),
        schema: listener.schema,
      };

      this.subscribe("get", {
        callback: (req) => listener.get(req),
        ...options,
      });
      this.subscribe("getById", {
        callback: (req) => listener.getById(req),
        ...options,
      });
      this.subscribe("post", {
        callback: (req) => listener.post(req),
        ...options,
      });
    });
  }

  subscribe(topic, listener) {
    if (
      typeof listener.callback !== "function" ||
      typeof listener.shouldProcess !== "function" ||
      listener.schema === null
    )
      return;
    this.listeners[topic] = [...this.listeners[topic], listener];
  }

  async notify(topic, payload) {
    const manufacturer = this.getManufacturer(payload);

    const results = await Promise.all(
      this.listeners[topic]
        .filter((listener) =>
          listener.shouldProcess(manufacturer.toLowerCase())
        )
        .map(async (listener) =>
          transform(await listener.callback(payload), listener.schema)
        )
    );
    return results.flat();
  }
}

module.exports = new PubSub();
