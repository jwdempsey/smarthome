const { listeners } = require('./subscribers');
const { transform } = require('node-json-transform');
const HTTPError = require('../models/HTTPError');

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
      payload.params?.manufacturer ||
      payload.body?.manufacturer ||
      payload.query?.manufacturer ||
      'all'
    );
  }

  subscribeAll() {
    listeners.forEach((listener) => {
      const options = {
        shouldProcess: (topic, req) => listener.shouldProcess(topic, req),
        schema: listener.schema,
      };

      if (typeof listener.get === 'function') {
        this.subscribe('get', {
          callback: () => listener.get(),
          ...options,
        });
      }
      if (typeof listener.getById === 'function') {
        this.subscribe('getById', {
          callback: (req) => listener.getById(req),
          ...options,
        });
      }
      if (typeof listener.post === 'function') {
        this.subscribe('post', {
          callback: (req) => listener.post(req),
          ...options,
        });
      }
    });
  }

  subscribe(topic, listener) {
    if (
      typeof listener.callback !== 'function' ||
      typeof listener.shouldProcess !== 'function' ||
      listener.schema === undefined
    ) {
      throw new HTTPError('Invalid request', HTTPError.BadRequest);
    }

    this.listeners[topic] = [...this.listeners[topic], listener];
  }

  async notify(topic, payload) {
    const manufacturer = this.getManufacturer(payload).toLowerCase();

    const results = await Promise.allSettled(
      this.listeners[topic]
        .filter((listener) => listener.shouldProcess(manufacturer))
        .map(async (listener) => {
          try {
            const data = await listener.callback(payload);
            return transform(data, listener.schema);
          } catch (e) {
            throw new HTTPError(e.message, Error.BadRequest);
          }
        })
    );

    return results
      .filter((result) => result.status === 'fulfilled' && !result.value.error)
      .map((result) => result.value)
      .flat();
  }

  async request(action, req, res) {
    try {
      const response = await this.notify(action, req);
      res.send(response);
    } catch (e) {
      this.handleError(res, e);
    }
  }

  handleError(res, e) {
    console.error(e);
    if (e instanceof HTTPError) {
      res.status(e.status);
    } else {
      res.status(400);
    }
    res.send({ message: e.message });
  }
}

module.exports = new PubSub();
