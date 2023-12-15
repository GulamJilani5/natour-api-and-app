////////////
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

console.log('app.js');

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);

///// Unhandled error handling, It should be after all routes.

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`
  // });
  ///// new Error(errorMessage); // Built-in error has one argument only which is error message
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  ///// Whenever next has an argument, It always consider that argument as error object
  // next(err);

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  //))
});

app.use(globalErrorHandler);

module.exports = app;

/////Test...
