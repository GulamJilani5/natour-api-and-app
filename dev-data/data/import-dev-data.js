/////
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel.js');
// const dotenv = require('dotenv');  /// Not working giving error
// dotenv.config({ path: './config.env' });
require('dotenv').config();

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

/////READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

///// IMPORT DATA INTO DB

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

///// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
