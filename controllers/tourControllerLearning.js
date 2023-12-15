//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////// BEFORE FORMATTING INTO CLASS MODULE. UNTILL LECTURE 100.
////////////////

const Tour = require('../models/tourModel');

// const fs = require('fs');
// const path = require('path');
// // const tours = JSON.parse(
// //   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// // );
// console.log('__dirname', __dirname);
// const filepath = path.join(__dirname, '../dev-data/data/', 'tours-simple.json');
// console.log('filepath', filepath);
// const tours = JSON.parse(fs.readFileSync(filepath));

exports.getAllTours = async (req, res) => {
  try {
    ///// BUILD QUERY
    // 1A) Filtering(Querying, Reading)
    // 127.0.0.1:3000/api/tours?price=500&duration=5
    // 127.0.0.1:3000/api/tours?price[lte]=500&duration=5
    const queryObj = { ...req.query }; //MAKING SHALLOW COPY AND CREATING OBJECT SO THAT IT DOES REFERE THE SAME OBJECT(eg. req.query)
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    // console.log(req.query, queryObj);

    // 1B) Advance filtering
    // { duration: { '$gte': '5' }, difficulty: 'easy' }
    let queryStr = JSON.stringify(queryObj); // MAKING JASON STRING
    //// b - exact match, g - multiple match
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));

    let query = Tour.find(JSON.parse(queryStr));
    // const query = Tour.find({ duration: '5', difficulty: 'easy' });
    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');'

    ///// 2) SORTING
    // // 127.0.0.1:3000/api/tours?sort=price,duration
    if (req.query.sort) {
      // console.log(req.query.sort); // price,duration
      const sortBy = req.query.sort.split(',').join(' '); // price duration
      // console.log('sortBy ', sortBy);
      // query = query.sort('price duration');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-creatAt');
    }
    ///// Field Limiting
    // 127.0.0.1:3000/api/tours?field=name,duration,difficulty,price
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      // console.log('fields', fields);
      // query = query.select('name duration difficulty price');
      query = query.select(fields);
    } else {
      // excluding '__v' to send in the response, alternatively we can do in schema creation time as well(eg. for password).
      // shcema option - {select:false}
      query.select('-__v');
    }

    ///// Pagination
    // 127.0.0.1:3000/api/tours?page=2&limit=3
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    ///// EXECUTE QUERY
    const tours = await query;
    // console.log('tours ', tours);

    ///// SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    console.log('ERROR ', error);
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.aliasTopTours = (req, res, next) => {
  // this middleware make the api endpoint looks like below one
  // 127.0.0.1:3000/api/tours/?limit=5&sort=-ratingsAverage,price
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,ratingsAverage,summary';

  next();
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id: req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    console.log('ERROR ', error);
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    console.log('req.body', req.body);
    ////// METHOD 1
    // const newTour = new Tour(req.body);
    // newTour.save();
    ///// METHOD 2
    const newTour = await Tour.create(req.body);
    console.log('newTour', newTour);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (error) {
    console.log('ERROR ', error);
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    console.log('ERROR ', error);
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: 'Successfully deleted'
    });
  } catch (error) {
    console.log('ERROR ', error);
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
