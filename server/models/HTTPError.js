module.exports = class HTTPError extends Error {
  static NotModified = 304;
  static BadRequest = 400;
  static Unauthorized = 401;
  static NotFound = 404;
  static InternalServerError = 500;

  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'HTTPError';
  }
};
