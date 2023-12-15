/////
const mongoose = require('mongoose');

//// All the error that are not asynchronous. i.e synchronous code that are not handled anywhere in our code, like - variable not define
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION: Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// const dotenv = require('dotenv');  /// Not working giving error
// dotenv.config({ path: './config.env' });
require('dotenv').config();

const app = require('./app');
console.log('server.js');

const DB_String = process.env.DB_CONNECTION.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);

mongoose
  .connect(DB_String, {
    //   useNewUrlparser: true
  })
  .then(() => {
    console.log('Database connection is successfull!');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

/// Handling all the non handled asynchronous error in our application.
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION: Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // 0 - no errorexit, 1 - error exit
  });
});
