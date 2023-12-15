const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  console.log('message...', message);
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  // console.log('err.errmsg..........', err.errmsg);
  const value = err.errmsg.match(/['"]([^'"]*)['"]/)[0];
  // console.log('value', value);
  const message = `Duplicate field value ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  // 1) Operational, trusted error: send message to client
  // console.log('ERROR sendErrorProd...', err);
  console.log('err.isOperational', err.isOperational);
  if (err.isOperational) {
    // if (true) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err.message
    });
  } else {
    // Programming or either unknown error: don't leak error details
    console.log('ERROR: ', err);

    //2) Send generic error message to client
    res.status(500).json({
      status: 'error....',
      message: 'Something went very wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    ///// Three type of operational error
    /// 1) Invalid database IDs, name is CastError
    // let error = { ...err }; ///***** This line is not working as a shallow copy in my code
    let error;
    // console.log('error === err', error == err);
    // console.log('ERR1', err);
    // console.log('ERROR1', error);
    // console.log('error.name', err.name);
    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }

    /// 2) Duplicate database fields
    // This error does not have 'name' properties. It is not mongoose error. But it is mongodb error.
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }

    // 3) Validation error
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

    sendErrorProd(error, res);
  }
};
