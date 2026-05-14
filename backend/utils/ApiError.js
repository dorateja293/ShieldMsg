export class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message Reason for failure
   */
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}
