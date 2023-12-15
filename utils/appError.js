class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //// We are handling only operational error

    Error.captureStackTrace(this, this.constructor); ///// Including stack trace of error's occurrance or function call
  }
}

module.exports = AppError;
